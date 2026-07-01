import Editor from "@monaco-editor/react";
import { socket } from "../socket/socket";

function CodeEditor({
  code,
  setCode,
  roomId,
}) {

  const handleEditorDidMount = (
    editor
  ) => {

    editor.onDidChangeCursorPosition(
      (e) => {

        socket.emit(
          "cursor-move",
          {
            roomId,
            username:
              localStorage.getItem(
                "username"
              ),
            line:
              e.position.lineNumber,
          }
        );

      }
    );

  };

  return (
    <Editor
      height="500px"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={(value) => {
        setCode(value || "");
      }}
      onMount={handleEditorDidMount}
    />
  );
}

export default CodeEditor;