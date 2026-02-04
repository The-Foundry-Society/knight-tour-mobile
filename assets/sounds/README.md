# Sound Files for Knight's Tour

This folder should contain 5 audio files for game sound effects.

## Supported Formats

✅ **WAV** - Uncompressed, high quality (larger file size)
✅ **MP3** - Compressed, smaller size (recommended for mobile)
✅ **M4A** - Apple's compressed format
✅ **AAC** - Advanced audio codec

**Recommendation**: Use MP3 for smallest file size, or WAV if you want highest quality.

## Required Files

Place these audio files in this directory (use same extension for all):

1. **move.wav** (or .mp3) - Played when knight moves successfully (short click/tap sound)
2. **win.wav** (or .mp3) - Played when you complete the board (celebration sound)
3. **stuck.wav** (or .mp3) - Played when you run out of moves (error/buzzer sound)
4. **undo.wav** (or .mp3) - Played when you undo a move (soft whoosh sound)
5. **invalid.wav** (or .mp3) - Played when you tap an invalid square (gentle beep)

## Where to Get Sound Files

### Option 1: Download Free Sounds
- **Freesound.org** - https://freesound.org (requires free account)
  - Search for: "click", "win", "error", "whoosh", "beep"
- **Zapsplat.com** - https://zapsplat.com (free with attribution)
  - Browse: Game sounds → UI sounds
- **Mixkit.co** - https://mixkit.co/free-sound-effects/ (completely free)
  - Browse: Sound effects → Game sounds

### Option 2: Use Simple Online Generators
- **Bfxr** - https://www.bfxr.net/ (retro game sounds)
- **ChipTone** - https://sfbgames.itch.io/chiptone (8-bit style sounds)

### Option 3: Record Your Own
Use your phone's voice recorder or any audio software to make custom sounds!

## Recommended Sound Characteristics

- **Format**: MP3 or WAV (both work perfectly)
- **Duration**: 0.3-1 second (short sounds work best)
- **Volume**: Moderate (not too loud)
- **Style**: Simple, subtle, non-annoying

## How to Enable Sounds After Adding Files

Once you've added all 5 audio files to this folder:

1. Open `hooks/useSounds.ts`
2. Find the commented code block (lines 31-49)
3. **IMPORTANT**: Update the file extensions to match your files:
   - If you're using WAV files: keep `.wav`
   - If you're using MP3 files: change `.wav` to `.mp3`
4. Uncomment all the lines between `/*` and `*/`
5. Save the file
6. Reload the app in Expo Go

You should see: `✅ Sounds loaded successfully!` in the console.

## Testing

- Toggle the sound button (🔊/🔇) in the game
- Make a move to hear the "move" sound
- Complete a board to hear the "win" sound
- Get stuck to hear the "stuck" sound
- Press undo to hear the "undo" sound

## Troubleshooting

**Sounds don't play:**
- Make sure files are named exactly: `move.wav`, `win.wav`, etc. (or `.mp3` if using MP3)
- Check that files are in the correct folder: `assets/sounds/`
- Verify the file extensions in the code match your actual files (.wav vs .mp3)
- Verify you uncommented the code in `useSounds.ts`
- Check phone volume is up and not on silent mode
- Restart the Expo dev server after adding files

**Console shows errors:**
- Files might be corrupted or wrong format
- Try converting to MP3 or WAV using online converter (e.g., https://cloudconvert.com/)
- Make sure files are small:
  - MP3: < 50KB recommended
  - WAV: < 200KB recommended
