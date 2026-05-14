import asyncio
import pytest
import contextlib
from unittest.mock import AsyncMock, MagicMock, patch
from agents.main_agent.streaming.stream_processor import process_agent_stream

@pytest.mark.asyncio
async def test_stream_processor_closes_source_on_cancellation():
    """
    Verifies that process_agent_stream properly closes the source agent_stream
    when it is itself closed early (cancellation scenario).
    """
    class MockAgentStream:
        def __init__(self):
            self.closed = False
            self.yielded = False
            
        def __aiter__(self):
            return self
            
        async def __anext__(self):
            if self.yielded:
                raise StopAsyncIteration
            self.yielded = True
            # Return an event that will definitely cause a yield in process_agent_stream
            return {"type": "metadata", "usage": {"totalTokens": 10}}
            
        async def aclose(self):
            self.closed = True

    agent_stream = MockAgentStream()
    
    # Start the processor
    gen = process_agent_stream(agent_stream)
    
    # Get one event
    try:
        await anext(gen)
    except StopAsyncIteration:
        pass
    
    # Manually close the processor generator
    await gen.aclose()
    
    # Verify the source stream was closed
    assert agent_stream.closed is True, "Source agent_stream was not closed by the processor"

@pytest.mark.asyncio
async def test_stream_coordinator_flushes_on_cancellation():
    """
    Verifies that StreamCoordinator performs an emergency flush when 
    the stream is cancelled.
    """
    from agents.main_agent.streaming.stream_coordinator import StreamCoordinator
    
    mock_agent = MagicMock()
    # Create an async generator for the mock stream
    async def mock_stream_async(prompt):
        yield {"type": "message_start", "data": {"role": "assistant"}}
        yield {"type": "content_block_delta", "data": {"type": "text", "text": "hello"}}
    
    mock_agent.stream_async = mock_stream_async
    
    mock_session_manager = MagicMock()
    mock_session_manager.message_count = 0
    
    coordinator = StreamCoordinator()
    with patch.object(StreamCoordinator, '_emergency_flush') as mock_flush:
        gen = coordinator.stream_response(
            agent=mock_agent,
            session_manager=mock_session_manager,
            prompt="hi",
            session_id="s1",
            user_id="u1"
        )
        
        # Get one event
        await anext(gen)
        
        # Manually close the generator
        await gen.aclose()
        
        # Verify emergency flush was called
        mock_flush.assert_called_once_with(mock_session_manager)

@pytest.mark.asyncio
async def test_stream_processor_early_exit_on_completion():
    """
    Verifies that process_agent_stream exits early once both 'complete' 
    and 'result' have been seen, even if more events exist in the source stream.
    """
    class MockAgentStream:
        def __init__(self):
            self.events = [
                {"type": "message_start", "data": {"role": "assistant"}},
                {"type": "complete", "complete": True}, # Signals completion
                {"type": "result", "result": {"metrics": {"latency": 100}}}, # Final metrics
                {"type": "ignored_event"} # Should never be reached
            ]
            self.index = 0
            self.closed = False
            
        def __aiter__(self):
            return self
            
        async def __anext__(self):
            if self.index >= len(self.events):
                raise StopAsyncIteration
            event = self.events[self.index]
            self.index += 1
            return event
            
        async def aclose(self):
            self.closed = True

    agent_stream = MockAgentStream()
    
    # Run the processor to completion
    events = []
    async for event in process_agent_stream(agent_stream):
        events.append(event)
        
    # Verify we got the expected events but NOT the 'ignored_event'
    event_types = [e.get("type") for e in events]
    assert "complete" in event_types
    # Note: 'result' itself is NOT yielded by the processor (it's internal)
    assert "ignored_event" not in event_types
    
    # The key check: Did we stop consuming the source stream at index 3?
    # Index 0: message_start
    # Index 1: complete
    # Index 2: result (triggers break)
    # So index should be exactly 3 (meaning we didn't read Index 3: ignored_event)
    assert agent_stream.index == 3, f"Processor consumed too many events: {agent_stream.index}"
    assert agent_stream.closed is True
