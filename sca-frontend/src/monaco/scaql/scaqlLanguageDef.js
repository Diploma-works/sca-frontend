export const scaqlLanguageDef = {
    tokenizer: {
        root: [
            [/(SELECT|FROM|select|from)/, "keyword"],
            [/(git_info|problems|arch)/, "attribute.name"],
            [/(\*)/, "operator.sql"],
            [/,/, "delimiter"],
            [/[a-zA-Z0-9_-]+/, ""],
        ],
    },
};