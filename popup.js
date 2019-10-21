function listenForCommands() {
  document.getElementById("downloadButton").addEventListener('click', statements);
}

function statements() {
  console.log("Downloads requested");
  const lastDate = document.getElementById('lastDate').value;
  browser.tabs.query({active: true, currentWindow: true})
  .then(tabs => tellContentToPress(tabs, lastDate));
}

function tellContentToPress(tabs, lastDate) {
  browser.tabs.sendMessage(tabs[0].id,
    {
      command: "download",
      lastDate: lastDate
    }
  );
}

browser.tabs.executeScript({file: "content.js"})
.then(listenForCommands);