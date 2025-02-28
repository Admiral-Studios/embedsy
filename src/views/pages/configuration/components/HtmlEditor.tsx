import { html } from '@codemirror/lang-html'
import CodeMirror from '@uiw/react-codemirror'

type Props = {
  htmlText: string
  onChange: (v: string) => void
}

const HtmlEditor = ({ htmlText, onChange }: Props) => {
  const handleChange = (value: string) => {
    onChange(value)
  }

  return (
    <>
      <CodeMirror
        value={htmlText}
        height='300px'
        extensions={[html()]}
        theme='light'
        onChange={handleChange}
        basicSetup={{ lineNumbers: true, foldGutter: true }}
        className='html-editor'
        autoFocus
      />
    </>
  )
}

export default HtmlEditor
