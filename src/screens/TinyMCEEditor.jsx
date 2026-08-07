import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/table";
import "tinymce/skins/ui/oxide/skin.css";

// Split into its own chunk so tinymce (core + skin CSS + plugins, a few
// hundred KB) only loads when the carer letter screen is actually opened —
// see the React.lazy(() => import("./TinyMCEEditor")) in CarerLetterScreen.jsx.
// Needs its own file because React.lazy requires a dynamic import() pointing
// at a module with a default export, and @tinymce/tinymce-react only exports
// Editor as a named export.
export default function TinyMCEEditor(props) {
  return <Editor {...props} />;
}
