const SvgWrapper = ({ src, width = 24, height = 24, style, ...props }) => {
    // If using direct SVG content (like your example)
    if (typeof src === 'string' && src.startsWith('<svg')) {
        return (
            <div
                dangerouslySetInnerHTML={{ __html: src }}
                style={{ width, height, ...style }}
                {...props}
            />
        );
    }

    // If using file imports
    return (
        <img
            src={src}
            width={width}
            height={height}
            style={style}
            alt=""
            {...props}
        />
    );
};

export default SvgWrapper;