(function() {
if(window.hasRun) {
  return;
}

window.hasRun = true;

let queue = [];

browser.runtime.onMessage.addListener(message => {
  console.log("Content receive a message", message.command, message.lastDate);
  switch(message.command) {
    case 'download': 
      deliverClicks(message.lastDate);
      break;
    case 'next': 
      console.log('Downloads left in the queue', queue.length);
      doClick(queue.pop());
      break;

  }
});


function parseDate(str) {
  var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  return (m) ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function doClick(a) {
  if(!a) {
    console.log('Queue empty');
    return;
  }
  let c = document.getElementById(a.id);
  const e = new Event('click');
  c.dispatchEvent(e);
  console.log('Clicked on', a.id);
}

function deliverClicks(lastDate) {

  const changeFormat = d => { d.match}

  let links = [...document.querySelectorAll("a[title='Print afschrift']")]
  .map(a => ({ id: a.id, date: a.parentNode.nextSibling.firstChild.textContent }))
  .map(a => ({id: a.id, date: parseDate(a.date)}))
  .filter(a => a.date > lastDate);

  console.log("Found", links.length, "links");
  links.forEach(a => {
    queue.push(a);
  });

  doClick(queue.pop());
}

})();