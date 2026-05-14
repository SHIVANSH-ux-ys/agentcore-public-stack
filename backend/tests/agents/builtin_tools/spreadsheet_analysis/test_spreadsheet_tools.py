"""Comprehensive tests for the spreadsheet analysis tools (issue #261).

Covers:
1. list_spreadsheets: KB vs session files, filtering, size labeling.
2. analyze_spreadsheet: successful execution, error handling (missing file, 
   code error, download error), and file-size guardrails (#258).

Run from backend/:
    uv run --extra agentcore --extra dev python -m pytest tests/agents/builtin_tools/spreadsheet_analysis/test_spreadsheet_tools.py -v
"""

import base64
import os
from unittest.mock import MagicMock, patch

import pytest

from agents.builtin_tools.spreadsheet_analysis.analyze_tool import (
    FILE_SIZE_HARD_BYTES,
    FILE_SIZE_WARN_BYTES,
    make_analyze_tool,
)
from agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool import (
    make_list_spreadsheets_tool,
)

# ---------------------------------------------------------------------------
# Constants and Helpers
# ---------------------------------------------------------------------------

_BASE_FILE_INFO = {
    "filename": "data.csv",
    "source": "chat_attachment",
    "content_type": "text/csv",
    "document_id": "doc-1",
    "s3_key": "sessions/s1/data.csv",
    "s3_bucket": "my-bucket",
    "size_bytes": 1024,
}


def _make_analyze_tool():
    return make_analyze_tool(assistant_id=None, session_id="s1", user_id="u1")


def _make_list_tool(assistant_id=None):
    return make_list_spreadsheets_tool(assistant_id=assistant_id, session_id="s1", user_id="u1")


def _mock_ci_response(stdout="42\n", stderr="", is_error=False):
    return {
        "stream": [
            {
                "result": {
                    "isError": is_error,
                    "structuredContent": {"stdout": stdout, "stderr": stderr},
                }
            }
        ]
    }


# ---------------------------------------------------------------------------
# Test Suite: list_spreadsheets
# ---------------------------------------------------------------------------

class TestListSpreadsheets:
    @patch("agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool._get_kb_files")
    @patch("agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool._get_session_files")
    async def test_list_empty(self, mock_session, mock_kb):
        mock_kb.return_value = []
        mock_session.return_value = []
        
        tool_fn = _make_list_tool()
        result = await tool_fn()
        
        assert result["status"] == "success"
        assert "No spreadsheet files" in result["content"][0]["text"]

    @patch("agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool._get_kb_files")
    @patch("agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool._get_session_files")
    async def test_list_combined_sources(self, mock_session, mock_kb):
        mock_kb.return_value = [{**_BASE_FILE_INFO, "filename": "kb.csv", "source": "knowledge_base"}]
        mock_session.return_value = [{**_BASE_FILE_INFO, "filename": "session.csv", "source": "chat_attachment"}]
        
        tool_fn = _make_list_tool(assistant_id="ast-123")
        result = await tool_fn()
        
        text = result["content"][0]["text"]
        assert "kb.csv (knowledge_base" in text
        assert "session.csv (chat_attachment" in text
        assert len(result["files"]) == 2

    async def test_kb_files_query_logic(self):
        """Verify _get_kb_files queries DynamoDB correctly and filters non-tabular."""
        from agents.builtin_tools.spreadsheet_analysis.list_spreadsheets_tool import _get_kb_files
        
        mock_table = MagicMock()
        mock_table.query.return_value = {
            "Items": [
                {"filename": "data.csv", "status": "complete", "sizeBytes": 100, "PK": "AST#1", "SK": "DOC#1"},
                {"filename": "image.png", "status": "complete", "sizeBytes": 100, "PK": "AST#1", "SK": "DOC#2"},
                {"filename": "pending.csv", "status": "pending", "sizeBytes": 100, "PK": "AST#1", "SK": "DOC#3"},
            ]
        }
        
        with patch("boto3.resource") as mock_boto:
            mock_boto.return_value.Table.return_value = mock_table
            with patch.dict(os.environ, {"DYNAMODB_ASSISTANTS_TABLE_NAME": "test-table"}):
                files = await _get_kb_files("ast-1")
        
        assert len(files) == 1
        assert files[0]["filename"] == "data.csv"


# ---------------------------------------------------------------------------
# Test Suite: analyze_spreadsheet
# ---------------------------------------------------------------------------

class TestAnalyzeSpreadsheet:
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_file_not_found(self, mock_id, mock_find):
        mock_id.return_value = "ci-123"
        mock_find.return_value = None
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="missing.csv", python_code="print(1)")
        
        assert result["status"] == "error"
        assert "not found" in result["content"][0]["text"]

    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._download_file")
    @patch("bedrock_agentcore.tools.code_interpreter_client.CodeInterpreter")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_successful_analysis(self, mock_id, mock_ci_class, mock_dl, mock_find):
        mock_find.return_value = _BASE_FILE_INFO
        mock_dl.return_value = b"raw-data"
        mock_id.return_value = "ci-1"
        
        mock_ci = MagicMock()
        mock_ci.invoke.return_value = _mock_ci_response(stdout="The answer is 42")
        mock_ci_class.return_value = mock_ci
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="data.csv", python_code="print('...')")
        
        assert result["status"] == "success"
        assert "The answer is 42" in result["content"][0]["text"]

    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._download_file")
    @patch("bedrock_agentcore.tools.code_interpreter_client.CodeInterpreter")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_execution_error(self, mock_id, mock_ci_class, mock_dl, mock_find):
        mock_find.return_value = _BASE_FILE_INFO
        mock_dl.return_value = b"data"
        mock_id.return_value = "ci-1"
        
        mock_ci = MagicMock()
        mock_ci.invoke.return_value = _mock_ci_response(stderr="SyntaxError: ...", is_error=True)
        mock_ci_class.return_value = mock_ci
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="data.csv", python_code="bad code")
        
        assert result["status"] == "error"
        assert "SyntaxError" in result["content"][0]["text"]

    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._download_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_download_failure(self, mock_id, mock_dl, mock_find):
        mock_id.return_value = "ci-123"
        mock_find.return_value = _BASE_FILE_INFO
        mock_dl.side_effect = Exception("S3 Bucket Access Denied")
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="data.csv", python_code="print(1)")
        
        assert result["status"] == "error"
        assert "Access Denied" in result["content"][0]["text"]


# ---------------------------------------------------------------------------
# Test Suite: File Size Guardrails (Regression)
# ---------------------------------------------------------------------------

class TestFileSizeGuardrails:
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._download_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_hard_limit_rejection(self, mock_id, mock_dl, mock_find):
        mock_id.return_value = "ci-123"
        mock_find.return_value = {**_BASE_FILE_INFO, "size_bytes": FILE_SIZE_HARD_BYTES + 1024}
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="data.csv", python_code="print(1)")
        
        assert result["status"] == "error"
        assert "exceeds" in result["content"][0]["text"]
        mock_dl.assert_not_called()

    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._find_file")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._download_file")
    @patch("bedrock_agentcore.tools.code_interpreter_client.CodeInterpreter")
    @patch("agents.builtin_tools.spreadsheet_analysis.analyze_tool._get_code_interpreter_id")
    async def test_soft_limit_warning(self, mock_id, mock_ci_class, mock_dl, mock_find):
        mock_find.return_value = {**_BASE_FILE_INFO, "size_bytes": FILE_SIZE_WARN_BYTES + 1024}
        mock_dl.return_value = b"data"
        mock_id.return_value = "ci-1"
        
        mock_ci = MagicMock()
        mock_ci.invoke.return_value = _mock_ci_response(stdout="Result: 100")
        mock_ci_class.return_value = mock_ci
        
        tool_fn = _make_analyze_tool()
        result = await tool_fn(filename="data.csv", python_code="print(100)")
        
        assert result["status"] == "success"
        assert "⚠️" in result["content"][0]["text"]
        assert "Result: 100" in result["content"][0]["text"]
