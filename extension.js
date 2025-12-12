const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("Algo syntax extension activée");

	const decoKeywords1 = makeDecoration("#8b484eff", "none");
	const decoKeywords2 = makeDecoration("#0080C0", "bold");
	const decoKeywords3 = makeDecoration("#008000", "bold");
	const decoKeywords4 = makeDecoration("#8f438fff", "none");
	const decoKeywords5 = makeDecoration("#FF80C0", "bold");
	const decoKeywords7 = makeDecoration("#8000FF", "italic bold");
	const decoKeywords8 = makeDecoration("#cc0d0dff", "none");
	const decoOperators = makeDecoration("#FF0000", "bold");
	const decoNumbers = makeDecoration("#808080", "bold");
	const decoComments = makeDecoration("#FF8000", "bold");
	const decoStrings = makeDecoration("#FF0080", "bold");

	function makeDecoration(color, fontStyle) {
		return vscode.window.createTextEditorDecorationType({
			color,
			fontStyle
		});
	}

	const kw1 = [
		"Algo",
		"Fonction",
		"Procédure",
		"Retourne",
		"Retourner",
		"Début",
		"Fin"
	];

	const kw2 = [
		"Variable",
		"Constante",
		":"
	];

	const kw3 = [
		"entier",
		"réel",
		"texte",
		"booléen",
		"caractère"
	];

	const kw4 = [
		"Si",
		"Alors",
		"Sinon",
		"FSi",
		"Selon",
		"cas",
		"autre",
		"FSelon"
	];

	const kw5 = [
		"Pour",
		"à",
		"par",
		"FPour",
		"TantQue",
		"FTq",
		"Répéter",
		"FRépéter"
	];

	const kw7 = ["VRAI", "FAUX"];

	const kw8 = ["écrire", "aléa", "saisir", "écrireSRC", "ecrire", "ecrireSRC"];

	const kwLogic = [
		"ou",
		"Ou",
		"et",
		"Et",
		"mod",
		"Mod",
		"div",
		"Div",
		"non",
		"Non"
	];

	function updateDecoration(editor) {
		const activeEditor = editor || vscode.window.activeTextEditor;
		if(!activeEditor)
			return;

		if (activeEditor.document.languageId !== "algo")
			return clearAllDecorations(activeEditor);

		const text = activeEditor.document.getText();

		const rangesKw1 = [];
		const rangesKw2 = [];
		const rangesKw3 = [];
		const rangesKw4 = [];
		const rangesKw5 = [];
		const rangesKw7 = [];
		const rangesKw8 = [];
		const rangesOperators = [];
		const rangesNumbers = [];
		const rangesComments = [];
		const rangesStrings = [];
		
		findRegexRanges(/#.*/g, text, activeEditor, rangesComments);
		
		findRegexRanges(/"([^"\\]|\\.)*"/g, text, activeEditor, rangesStrings);

		findRegexRanges(/\b\d+([.,]\d+)?\b/g, text, activeEditor, rangesNumbers);

		findWordListRanges(kw1, text, activeEditor, rangesKw1);
		findWordListRanges(kw2, text, activeEditor, rangesKw2);
		findWordListRanges(kw3, text, activeEditor, rangesKw3);
		findWordListRanges(kw4, text, activeEditor, rangesKw4);
		findWordListRanges(kw5, text, activeEditor, rangesKw5);
		findWordListRanges(kw7, text, activeEditor, rangesKw7);
		findWordListRanges(kw8, text, activeEditor, rangesKw8);

		findRegexRanges(
		/←|<-|>=|<=|≤|≥|≠|[+\-/%*×><()&,[\]=]/g,
		text,
		activeEditor,
		rangesOperators
		);

		findWordListRanges(kwLogic, text, activeEditor, rangesOperators);

		activeEditor.setDecorations(decoComments, rangesComments);
		activeEditor.setDecorations(decoStrings, rangesStrings);
		activeEditor.setDecorations(decoNumbers, rangesNumbers);

		activeEditor.setDecorations(decoKeywords1, rangesKw1);
		activeEditor.setDecorations(decoKeywords2, rangesKw2);
		activeEditor.setDecorations(decoKeywords3, rangesKw3);
		activeEditor.setDecorations(decoKeywords4, rangesKw4);
		activeEditor.setDecorations(decoKeywords5, rangesKw5);
		activeEditor.setDecorations(decoKeywords7, rangesKw7);
		activeEditor.setDecorations(decoKeywords8, rangesKw8);

		activeEditor.setDecorations(decoOperators, rangesOperators);
	}

	function clearAllDecorations(editor) {
		editor.setDecorations(decoComments, []);
		editor.setDecorations(decoStrings, []);
		editor.setDecorations(decoNumbers, []);
		editor.setDecorations(decoKeywords1, []);
		editor.setDecorations(decoKeywords2, []);
		editor.setDecorations(decoKeywords3, []);
		editor.setDecorations(decoKeywords4, []);
		editor.setDecorations(decoKeywords5, []);
		editor.setDecorations(decoKeywords7, []);
		editor.setDecorations(decoKeywords8, []);
		editor.setDecorations(decoOperators, []);
	}

	function findRegexRanges(regex, text, editor, rangesArray) {
		let match;
		while ((match = regex.exec(text))) {
		const start = editor.document.positionAt(match.index);
		const end = editor.document.positionAt(match.index + match[0].length);
		rangesArray.push(new vscode.Range(start, end));
		}
	}

	function escapeForRegex(str) {
		return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	}

	function findWordListRanges(words, text, editor, rangesArray) {
		if (words.length === 0) return;
		const escaped = words.map(escapeForRegex);
		const pattern = "\\b(" + escaped.join("|") + ")\\b";
		const regex = new RegExp(pattern, "g");
		findRegexRanges(regex, text, editor, rangesArray);
	}

	function triggerUpdate(editor) {
		updateDecoration(editor);
	}

	triggerUpdate(vscode.window.activeTextEditor);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			triggerUpdate(editor);
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((event) => {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) return;
			if (event.document === activeEditor.document)
				triggerUpdate(activeEditor);
		})
	)
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}