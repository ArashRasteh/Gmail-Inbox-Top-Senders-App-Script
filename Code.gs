/** Created by ArashRasteh **/

// function listSenders() {
//   let threads = GmailApp.getInboxThreads(); // Get all threads in inbox
//   let senders = {}; // Object to store sender counts

//   threads.forEach(function(thread) {
//     var messages = thread.getMessages();
//     messages.forEach(function(message) {
//       var from = message.getFrom(); // Get sender address
//       // Simple counting (might need refinement for display names vs. emails)
//       senders[from] = (senders[from] || 0) + 1;
//     });
//   });

//   let totalCount = 0;
//   let senderArray = [];
//   for (var sender in senders) {
//     totalCount += senders[sender];
//     senderArray.push({sender, count: senders[sender]});
//   }

//   senderArray.sort((a, b) => b.count - a.count);

//   Logger.log("Total Count:", totalCount);

//   // Log the counts (or write to a Sheet)
//   Logger.log("Sender Counts:");
//   for (let senderIndex in senderArray) {
//     let sender = senderArray[senderIndex];
//     Logger.log(sender.sender.padEnd(100) + ": " + sender.count);
//   }
// }

/**
 * This function builds the UI when the add-on is opened.
 */
function buildAddOn(e) {
  // 1. Run your logic to get the sender data
  let senderData = getSenderStats();

  // 2. Create a Card Builder
  let card = CardService.newCardBuilder();
  let section = CardService.newCardSection().setHeader("Sender Statistics");

  // 3. Add data to the UI
  if (senderData.length === 0) {
    section.addWidget(CardService.newTextParagraph().setText("No messages found."));
  } else {
    // Limit to top 10 to keep the UI clean
    senderData.forEach(item => {

        // Try to match text inside < >
      let match = item.sender.match(/<([^>]+)>/);

      // If a match is found, use it; otherwise use the original string
      let emailOnly = match ? match[1] : htmlspecialchars(item.sender);
      section.addWidget(
        CardService.newKeyValue()
          .setTopLabel("Sender")
          .setContent((item.sender))
          .setBottomLabel(`${item.sender}
from:( ${emailOnly} )
Count: ${item.count}`)
      );
    });
  }

  return card.addSection(section).build();
}

/**
 * Your original logic, refactored to return an array instead of logging.
 */
function getSenderStats() {
  let threads = GmailApp.getInboxThreads(0, 300); // For testing, Limit to 20 threads for speed
  let senders = {};

  threads.forEach(thread => {
    let messages = thread.getMessages();
    let message = messages[0];
    let from = message.getFrom();
    senders[from] = (senders[from] || 0) + 1;
  });

  let senderArray = Object.keys(senders).map(key => {
    return { sender: key, count: senders[key] };
  });

  return senderArray.sort((a, b) => b.count - a.count);
}

function htmlspecialchars(str) {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;" // ' -> &apos; for XML only
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}
