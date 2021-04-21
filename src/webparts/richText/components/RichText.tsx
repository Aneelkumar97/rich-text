import * as React from 'react';
import styles from './RichText.module.scss';
import { IRichTextProps } from './IRichTextProps';
import { Editor as RichTextEditor } from '@tinymce/tinymce-react';

export interface IRichTextState {
    value: string;
    isMCELoaded: boolean;
}

export default class RichText extends React.Component<IRichTextProps, IRichTextState> {
    constructor(props: IRichTextProps) {
        super(props);
        this.state = {
            value: '<p>This is the initial content of the editor</p>',
            isMCELoaded: false
        };
        this.handleEditorChange = this.handleEditorChange.bind(this);
    }

    private handleEditorChange = (content: string, editor: any) => {
        debugger;
        console.log('Content was updated:', content);
        this.setState({
            value: content
        });
    }

    public componentDidMount() {
        debugger;
        let handler = setInterval(() => {
            if ((window as any).tinymce) {
                (window as any).tinymce.PluginManager.add('richtext-user-plugin', (editor, url) => {
                    const openDialog = function () {
                        return editor.windowManager.open({
                            title: 'Tag a user',
                            body: {
                                type: 'panel',
                                items: [
                                    {
                                        type: 'input',
                                        name: 'title',
                                        label: 'Title'
                                    }
                                ]
                            },
                            buttons: [
                                {
                                    type: 'cancel',
                                    text: 'Close'
                                },
                                {
                                    type: 'submit',
                                    text: 'Save',
                                    primary: true
                                }
                            ],
                            onSubmit(api) {
                                const data: any = api.getData();
                                const span = editor.getDoc().createElement('span');
                                span.className = 'mymention';
                                span.setAttribute('data-mention-title', data.title);
                                span.appendChild(editor.getDoc().createTextNode('@' + data.title));
                                editor.insertContent(`<em><b>${span.outerHTML}</b></em>`);
                                api.close();
                            }
                        });
                    };
                    /* Add a button that opens a window */
                    editor.ui.registry.addButton('richtext-user-plugin', {
                        text: 'Mention',
                        onAction() {
                            /* Open window */
                            openDialog();
                        }
                    });
                    editor.ui.registry.addMenuItem('richtext-user-plugin', {
                        text: 'Mention',
                        onAction() {
                            /* Open window */
                            openDialog();
                        }
                    });
                    return {
                        getMetadata() {
                            return {
                                name: 'Mention',
                                url: 'http://exampleplugindocsurl.com'
                            };
                        }
                    };
                });
                this.setState({
                    isMCELoaded: true
                });
                clearInterval(handler);
            }
        }, 1000);
    }

    public render(): React.ReactElement<IRichTextProps> {
        return (
            <div className={styles.richText} >
                <div style={{
                    visibility: 'hidden'
                }}>
                    <RichTextEditor
                        init={{
                            height: 0,
                            menubar: true,
                            plugins: [
                                'help'
                            ],
                            statusbar: false,
                            toolbar: 'help'
                        }}
                    />
                </div>
                {
                    this.state.isMCELoaded && <RichTextEditor
                        value={this.state.value}
                        init={{
                            height: 500,
                            menubar: false,
                            // external_plugins: {
                            //     'richtext-user-plugin': 'https://aneeltest.blob.core.windows.net/testcontainer/plugin.min.js'
                            // },
                            plugins: [
                                'richtext-user-plugin help'
                            ],
                            statusbar: false,
                            toolbar: 'richtext-user-plugin | help'
                        }}
                        onEditorChange={this.handleEditorChange}
                    />
                }
            </div >
        );
    }
}