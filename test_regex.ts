const text = "You activate your long-range scanner, a faint hum preceding a [terminal]VISUAL FEED ACQUIRED[/terminal]. Raghav's body fills the screen, the blue-grey skin more pronounced. A [warning]small, intricate device[/warning] is clamped to his wrist, pulsing with a faint, unfamiliar light. It's not a watch. As you zoom in, a faint [glitch]static[/glitch] briefly obscures the view, then clears to reveal a familiar symbol etched into the device's casing: a stylized 'M'. [terminal]UNIDENTIFIED DEVICE DETECTED. SCANNING...[/terminal] You should use your console to investigate further.";

const regex = /\[(glitch|shake|terminal|warning)\]([\s\S]*?)\[\/\1\]/gi;
let lastIndex = 0;
let match;

console.log("Testing regex on:", text);

while ((match = regex.exec(text)) !== null) {
    console.log("Match found:", match[0]);
    console.log("Effect:", match[1]);
    console.log("Content:", match[2]);
    lastIndex = regex.lastIndex;
}

if (lastIndex === 0) {
    console.log("No matches found.");
}
