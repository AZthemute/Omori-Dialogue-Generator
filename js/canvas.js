const normalFont = new FontFace("PAPERLILY_MAIN", "url(./css/fonts/NotoSans-Regular.ttf)");
const nameFont = new FontFace("PAPERLILY_NAME", "url(./css/fonts/AlegreyaSC-Regular.ttf)")
const altFont = new FontFace("PAPERLILY_ALT", "url(./css/fonts/Tetanus.ttf)");
document.fonts.add(normalFont);
document.fonts.add(altFont);

// Cursed workarounds - the dialogue boxes and portrait boxes respectively.
// This is needed to prevent issues with toDataURL DOM issues ("tainted canvas")
const img_dialogue = new Image();
img_dialogue.crossOrigin = "anonymous";
img_dialogue.src = "./imgs/base/frame_dialogue.png";

const img_name_separator = new Image();
img_name_separator.crossOrigin = "anonymous";
img_name_separator.src = "./imgs/base/dialogue_name_separator_2.png";

const img_ctc = new Image();
img_ctc.crossOrigin = "anonymous";
img_ctc.src = "./imgs/base/ctc.png";

// TODO: make this modular

function renderCanvas(idFrame, idDownload) {
  const has_name = document.getElementsByClassName("char-name")[0].value.length > 0;
  const has_bust = document.getElementsByClassName("toggle-portrait")[0].checked;

  const frame = document.getElementById(idFrame);
  let canvas;
  let dialogueBoxXBase;
  let dialogueBoxYBase;
  if (has_bust) {
    canvas = frame.getElementsByTagName("canvas")[1];
    frame.getElementsByTagName("canvas")[0].style.display = "none";
    dialogueBoxXBase = 411;
    dialogueBoxYBase = 711;
  }
  else {
    canvas = frame.getElementsByTagName("canvas")[0];
    frame.getElementsByTagName("canvas")[1].style.display = "none";
    dialogueBoxXBase = 0;
    dialogueBoxYBase = 0;
  }

  canvas.style.display = "block";
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let img_char = new Image();

  // Load character image and portrait box
  if (has_bust) {
    img_char.src = frame.getElementsByTagName("img")[0].src;
    ctx.drawImage(img_char, 0, 0);
  }
  // Load dialogue box
  ctx.drawImage(img_dialogue, dialogueBoxXBase, dialogueBoxYBase);

  // Load character name details
  let charName = document.getElementsByClassName("char-name")[0].value;

  /*
  // black outside
  ctx.fillStyle = "black";
  ctx.fillRect(0, 70, fullRectangleWidth, 44);
  // white outside
  ctx.fillStyle = "white";
  ctx.fillRect(1, 71, fullRectangleWidth - 2, 42);
  // black inside
  ctx.fillStyle = "black";
  ctx.fillRect(4, 74, fullRectangleWidth - 8, 36);
  */
  
  if (has_name) {
    // This is horrible because the first letter of each word is bigger than the rest.
    let lastWordEndedPosition = 0
    for (let charNameWord of charName.split(" ")) {
      // Adding 3 spaces was the only way I could find to get it consistent with the game.
      charNameWord = charNameWord.concat("   ")

      // Write character name
      ctx.fillStyle = "white";
      ctx.font = "44px NAME_FONT";
      let firstLetterWidth = ctx.measureText(charNameWord[0]).width;
      ctx.fillText(charNameWord[0], 138 + dialogueBoxXBase + lastWordEndedPosition, 94 + dialogueBoxYBase);
      
      ctx.font = "34px NAME_FONT";
      ctx.fillText(charNameWord.slice(1), 138 + dialogueBoxXBase + lastWordEndedPosition + firstLetterWidth, 94 + dialogueBoxYBase);

      lastWordEndedPosition += ctx.measureText(charNameWord[0]).width + ctx.measureText(charNameWord.slice(1)).width;
    }
    // Load name separator
    ctx.drawImage(img_name_separator, 90 + dialogueBoxXBase, 87 + dialogueBoxYBase);
  }

  // Load continue eye
  if (document.getElementById("toggle_ctc_0").checked) {
    ctx.drawImage(img_ctc, 918 + dialogueBoxXBase, 231 + dialogueBoxYBase);
  }

  // Load textarea
  let dialogue = document.getElementsByClassName("dialogue-box")[0].value;
  let splitDialogue = dialogue.split("\n");

  // 29px between lines
  // max 585px

  function insertDialogue(context, unsplitText) {
    // Source/Adapted from: https://gh.princessrtfm.com/niko.html
    // Check out https://github.com/PrincessRTFM, they're hella huge brain
    // for the logic of this thing.
    let xBase = 135 + dialogueBoxXBase; // Determined from doing some alignment in Paint.NET
    let yBase = 88 + dialogueBoxYBase; // Determined by same method
    if (has_name) yBase = 150 + dialogueBoxYBase;
    let maxLineLength = 1000; // Determined by same method
    let splitText = unsplitText.split("\n");

    for (let lineNo = 0; lineNo < splitText.length; lineNo++) {
      if ((lineNo >= 4) && (has_name)) {
        alert('Only a maximum of four lines can fit when you have a name. The fifth line and so has not been rendered.');
        break;
      }
      else if (lineNo >= 5) {
        alert('Only a maximum of five lines can fit. The sixth line and so has not been rendered.');
        break;
      }
      let line = splitText[lineNo];

      // Check if
      if (context.measureText(line).width > maxLineLength) {
        const words = line.split(/\s/u);
        for (let word = words.length; word > 0; word--) {
          const left = words.slice(0, word).join(" ");
          debugger;
          if (context.measureText(left).width <= maxLineLength) {
            line = left;
            splitText.splice(lineNo + 1, 0, words.slice(word).join(" "));
            break;
          }
        }
      }
      context.fillText(line, xBase, yBase + (41 * lineNo), maxLineLength);
    }
  }

  function changeDownloadLink() {
    let downloadLink = document.getElementById(idDownload);
    canvas = frame.getElementsByTagName("canvas")[0];
    downloadLink.href = canvas.toDataURL("image/png");
  }

  // Had to be explicit here with everthing, otherwise dialogue would just
  // refuse to render.
  ctx.fillStyle = "white";
  if (document.getElementById("toggle_disturbed_0").checked) {
    altFont.load().then(function() {
      ctx.font = "30px PAPERLILY_ALT";
      insertDialogue(ctx, dialogue);
      changeDownloadLink();
    });
  } else {
    ctx.font = "30px PAPERLILY_MAIN";
    insertDialogue(ctx, dialogue);
    changeDownloadLink();
  }



  /*
  Credits - giving credit where credit is due.

  Noel A Rodriguez, https://dev.to/thehomelessdev/how-to-add-a-custom-font-to-an-html-canvas-1m3g
  Jerry, https://stackoverflow.com/a/66969479
  https://dopiaza.org/tools/datauri/index.php

  */
}
