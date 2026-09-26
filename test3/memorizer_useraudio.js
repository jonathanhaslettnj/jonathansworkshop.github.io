<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Talking Bible Verse Memorizer</title>

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 1rem;
      background: #f7f7f7;
      font-size: 1.2rem;
      line-height: 1.5;
    }

    h1, h2 {
      color: darkblue;
      text-align: center;
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-top: 1rem;
      font-weight: bold;
    }

    input[type="text"], select {
      width: 100%;
      padding: 0.8rem;
      font-size: 1.2rem;
      border-radius: 8px;
      border: 1px solid #999;
      margin-top: 0.3rem;
      box-sizing: border-box;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 1rem;
    }

    button {
      padding: 0.6rem 1rem;
      font-size: 1rem;
      border-radius: 8px;
      border: none;
      background: #005bbb;
      color: white;
      flex: 0 0 auto;
    }

    button:active {
      background: #004999;
    }

    .delete-btn {
      background: #bb0000;
    }

    #verseDisplay {
      font-size: 1.3rem;
      margin-top: 1rem;
      min-height: 2rem;
    }

    #statusDisplay {
      font-size: 1.1rem;
      margin-top: 0.5rem;
      color: #444;
      min-height: 1.5rem;
    }

    #user-verses {
      margin-top: 1rem;
      font-size: 1.1rem;
    }

    .verse-item {
      background: white;
      padding: 0.8rem;
      border-radius: 8px;
      margin-bottom: 0.8rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }

    hr {
      margin: 2rem 0;
    }

    .return-box {
      background: #e6f2ff;
      border: 2px solid #7aaee6;
      padding: 12px;
      margin: 40px auto 0 auto;
      width: 70%;
      max-width: 350px;
      border-radius: 8px;
      font-size: 20px;
      text-align: center;
    }

    .qr-section {
      text-align: center;
      margin-top: 40px;
    }

    .qr-section img {
      max-width: 200px;
      display: inline-block;
    }
  </style>
</head>

<body>

  <h1>The Talking Bible Verse Memorizer</h1>

  <!-- LIST SELECTOR -->
  <label for="mv_list_selector"><strong>Choose verse list:</strong></label>
  <select id="mv_list_selector">
    <option value="A">List A (Original Non‑Audio)</option>
    <option value="B">List B (Audio Version)</option>
    <option value="C">List C (Unified List)</option>
  </select>
  <button id="mv_load_list_btn">Load Selected List</button>

  <label for="refInput">Reference: (Type then press Enter)</label>
  <input id="refInput" type="text" placeholder="John 1:1">

  <p id="verseDisplay"></p>
  <p id="statusDisplay"></p>

  <label for="wordInput">Type next word, then press space:</label>
  <input id="wordInput" type="text">

  <div class="button-row">
    <button id="repeatBtn">Repeat Verse ↻</button>
    <button id="resetBtn">Start Over</button>
  </div>

  <hr>

  <h2>Add to Unified List (List C)</h2>

  <label for="userRefInput">Reference:</label>
  <input id="userRefInput" type="text" placeholder="John 1:1">

  <label for="userTextInput">Verse text:</label>
  <input id="userTextInput" type="text" placeholder="In the beginning was the Word...">

  <div class="button-row">
    <button id="addUserVerseBtn">Add to My Unified List</button>
  </div>

  <h2>Your Verses</h2>
  <div id="user-verses"></div>

  <script src="memorizer_useraudio.js?v=2"></script>

  <div class="return-box">
    <a href="https://jonathansworkshop.online/memorizer/index.html">Bible Memorizer Information</a>
  </div>

  <div class="qr-section">
    <h2>Scan to Share the Bible Memorizer</h2>
    <img src="QR Code.jpg" alt="QR Code">
  </div>

</body>
</html>
