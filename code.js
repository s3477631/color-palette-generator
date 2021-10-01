figma.showUI(__html__);
figma.ui.resize(400, 300);
const COLOR_SET = 255;
const convertColor = (colorObj) => {
    const { a, r, g, b } = colorObj;
    let red;
    let green;
    let blue;
    let alpha;
    red = parseInt((r * COLOR_SET).toString(), 0);
    green = parseInt((g * COLOR_SET).toString(), 0);
    blue = parseInt((b * COLOR_SET).toString(), 0);
    const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
    figma.ui.postMessage(JSON.stringify({ color: `${hex}` }));
};
const generateCode = (paletteName, palette) => {
    return `$${paletteName}: (
    ${Object.keys(palette).map((key, index) => `${key}:${palette[key]}\n`)}
 )
 `;
};
figma.ui.onmessage = (message) => {
    const rawObject = JSON.parse(message);
    const paletteName = Object.keys(rawObject).toString();
    const colorValues = Object.entries(rawObject);
    const palette = colorValues[0][1];
    figma.ui.postMessage(JSON.stringify({ code: `${generateCode(paletteName, palette)}` }));
};
// sorry for any
const loopingFunction = (selection, selectionType) => {
    return selection.reduce((acc, curr) => {
        if (curr.type == selectionType) {
            return loopingFunction(curr.children, selectionType);
        }
        if (curr.type == 'VECTOR') {
            const name = (curr.name).split('/')[0];
            const objWithName = Object.assign({ name: name }, ...curr.fills);
            const objWithWeight = Object.assign({ weight: (curr.name).split('/')[1] }, objWithName);
            //        console.log(curr.fills);
            acc.push(objWithWeight);
        }
        return acc;
    }, []);
};
figma.on('selectionchange', () => {
    const selectedChildren = loopingFunction(figma.currentPage.selection, 'GROUP');
    selectedChildren.reverse().forEach((selectedColor) => {
        convertColor(selectedColor.color);
    });
});
