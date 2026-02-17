export const printTree = (tree, code) => {
    let output = [];

    const walk = (node, indent) => {
        const name = node.type.name;
        const from = node.from;
        const to = node.to;
        const text = code.slice(from, to);

        output.push(`${" ".repeat(indent)}${name} [${from}, ${to}] "${text}"`);

        let cursor = node.cursor();
        if (cursor.firstChild()) {
            do {
                walk({ type: cursor.type, from: cursor.from, to: cursor.to, cursor: () => cursor }, indent + 2);
            } while (cursor.nextSibling());
            cursor.parent();
        }
    }

    walk(tree.topNode, 0);

    console.log("=== SCAQL TREE ===");
    console.log(output.join("\n"));
}
