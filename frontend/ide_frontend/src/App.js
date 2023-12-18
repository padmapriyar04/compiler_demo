import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-dreamweaver';
import axios from 'axios';
import './App.css';

function App() {
  const [language, setLanguage] = useState('py');
  const [code, setCode] = useState('');
  const editorRef = useRef(); // Use useRef instead of createRef

  useEffect(() => {
    // Update Ace editor mode when language changes
    if (editorRef.current) {
      const aceEditor = editorRef.current.editor;
      if (language === 'js') {
        aceEditor.getSession().setMode('ace/mode/javascript');
      } else if (language === 'cpp') {
        aceEditor.getSession().setMode('ace/mode/c_cpp');
      } else if (language === 'py') {
        aceEditor.getSession().setMode('ace/mode/python');
      }
    }
  }, [language]);

  const changeLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  const executeCode = async () => {
    try {
      const postData = {
        title: language,
        body: code,
      };
      const response = await axios.post('http://localhost:3000/code', postData);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <div className="header">Online IDE</div>
      <div className="control-panel">
        Select language:
        <select className="languages" value={language} onChange={(e) => changeLanguage(e.target.value)}>
          <option value="py">Python</option>
          <option value="js">Javascript</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <AceEditor
        ref={editorRef}
        mode={language === 'js' ? 'javascript' : language}
        theme="dreamweaver"
        onChange={(newCode) => setCode(newCode)}
        value={code}
        editorProps={{ $blockScrolling: true }}
      />
      <div className="button-container">
        <button className="btn" onClick={executeCode}>
          Run
        </button>
      </div>
      <div className="output"></div>
    </div>
  );
}

export default App;

