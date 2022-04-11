import SimpleMdeImpl from "simplemde";
import * as React from "react";

interface Target {
  name: string;
  value: string;
}
interface MdEditorProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: ({ target }: { target: Target }) => void;
  minHeight: number;
}
export class MdEditor extends React.Component<MdEditorProps, Readonly<{}>> {
  textareaRef: { current: null | HTMLTextAreaElement } = React.createRef();
  simpleMde: SimpleMdeImpl | null = null;
  static defaultProps = {
    minHeight: 100,
  };
  render() {
    return (
      <div
        className="md-editor-root focus:ring-1"
        style={{ minHeight: this.props.minHeight }}
      >
        <textarea name={this.props.name} ref={this.textareaRef} />
      </div>
    );
  }
  componentDidMount() {
    this.simpleMde = new SimpleMdeImpl({
      spellChecker: false,
      element: this.textareaRef.current ?? undefined,
      initialValue: this.props.defaultValue,
      toolbar: false,
      status: false,
      shortcuts: {
        drawLink: "Shift-Cmd-K",
      },
    });

    this.simpleMde.codemirror.options.extraKeys["Tab"] = false;
    this.simpleMde.codemirror.options.extraKeys["Shift-Tab"] = false;
  }
  shouldComponentUpdate() {
    return false;
  }
  componentWillUnmount() {
    if (this.simpleMde) {
      this.simpleMde.toTextArea();
      this.simpleMde = null;
    }
  }
}
