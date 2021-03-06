var CanvasPool = require('../../dom/CanvasPool');

/**
* Calculates the ascent, descent and fontSize of a given font style.
*
* @method Phaser.GameObject.Text#determineFontProperties
* @private
* @param {object} textStyle
*/
var MeasureText = function (textStyle, testString)
{
    if (testString === undefined) { testString = '|MÉqgy'; }

    /**
     * @property {HTMLCanvasElement} canvas - The canvas element that the text is rendered.
     */
    var canvas = CanvasPool.create(this);

    /**
     * @property {HTMLCanvasElement} context - The context of the canvas element that the text is rendered to.
     */
    var context = canvas.getContext('2d');

    //   DEBUG :)
    // document.body.appendChild(canvas);

    textStyle.syncFont(canvas, context);

    var width = Math.ceil(context.measureText(testString).width);
    var baseline = width;
    var height = 2 * baseline;

    baseline = baseline * 1.4 | 0;

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = '#f00';
    context.fillRect(0, 0, width, height);

    context.font = textStyle.font;

    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText(testString, 0, baseline);

    var output = {
        ascent: 0,
        descent: 0,
        fontSize: 0
    };

    if (!context.getImageData(0, 0, width, height))
    {
        output.ascent = baseline;
        output.descent = baseline + 6;
        output.fontSize = output.ascent + output.descent;

        CanvasPool.remove(canvas);

        return output;
    }

    var imagedata = context.getImageData(0, 0, width, height).data;
    var pixels = imagedata.length;
    var line = width * 4;
    var i;
    var j;
    var idx = 0;
    var stop = false;

    context.fillStyle = '#00ff00';
    context.fillRect(0, baseline, width, 1);

    // ascent. scan from top to bottom until we find a non red pixel
    for (i = 0; i < baseline; i++)
    {
        for (j = 0; j < line; j += 4)
        {
            if (imagedata[idx + j] !== 255)
            {
                stop = true;
                context.fillStyle = '#ffff00';
                context.fillRect(0, i, width, 1);
                break;
            }
        }

        if (!stop)
        {
            idx += line;
        }
        else
        {
            break;
        }
    }

    output.ascent = baseline - i;

    idx = pixels - line;
    stop = false;

    // descent. scan from bottom to top until we find a non red pixel
    for (i = height; i > baseline; i--)
    {
        for (j = 0; j < line; j += 4)
        {
            if (imagedata[idx + j] !== 255)
            {
                stop = true;
                context.fillStyle = '#ffffff';
                context.fillRect(0, i, width, 1);
                break;
            }
        }

        if (!stop)
        {
            idx -= line;
        }
        else
        {
            break;
        }
    }

    output.descent = (i - baseline);
    output.fontSize = output.ascent + output.descent;

    //  DEBUG
    // CanvasPool.remove(canvas);
    console.log(output);

    return output;
};

module.exports = MeasureText;
