/** Created by Arash (Ash) Rasteh under MIT License. Check LICENSE File for more details on License. */

const COUNT_CUT_OFF = 3

/**
 * This function builds the UI when the add-on is opened.
 */
function buildAddOn(e) {
  // 1. Run your logic to get the sender data
  let senderData = getSenderStats();

  // 2. Create a Card Builder
  let card = CardService.newCardBuilder();

  // Top domain Section
  let domainSection = CardService.newCardSection().setHeader("Top Domain Statistics");

  if (senderData.length === 0) {
    domainSection.addWidget(CardService.newTextParagraph().setText("No messages found."));
  } else {
    const domainData = {}
    senderData.forEach(sender => {
      domain = sender.domain
      domainData[domain] = (domainData[domain] || 0) + sender.count;
    });

    const domainArray = Object.keys(domainData).map((domain) => {
      return {domain, count: domainData[domain]}
    })

    domainArray.sort((a, b) => b.count - a.count);

    domainSection.addWidget(
      //label: inbox from:(@*usbank.com ) 
      CardService.newKeyValue().setBottomLabel('label: inbox from:(@*DOMAIN )')
    )

    domainArray.forEach((domain) => {
      if (domain.count < COUNT_CUT_OFF) {
        return;
      }

      domainSection.addWidget(
        CardService.newKeyValue().setBottomLabel(`${domain.domain.padEnd(39).replaceAll(' ', '&nbsp;')} ${domain.count}`)
      );
    })
  }


  // Top Sender Section
  let section = CardService.newCardSection().setHeader("Sender Statistics");

  if (senderData.length === 0) {
    section.addWidget(CardService.newTextParagraph().setText("No messages found."));
  } else {
    // Limit to top 10 to keep the UI clean
    senderData.forEach(sender => {
      if (sender.count < COUNT_CUT_OFF) {
        return;
      }
      
      section.addWidget(
        CardService.newKeyValue()
          .setContent((sender.sender))
          .setBottomLabel(`${sender.sender}
from:( ${sender.email} )
Count: ${sender.count}
<br>`)
      );
    });
  }

  return card.addSection(domainSection).addSection(section).build();
}

/**
 * Your original logic, refactored to return an array instead of logging.
 */
function getSenderStats() {
  let threads = GmailApp.getInboxThreads(0, 200); // For testing, Limit to 20 threads for speed
  let senderCount = {};

  threads.forEach(thread => {
    let messages = thread.getMessages();
    let message = messages[0];
    let sender = message.getFrom();
    senderCount[sender] = (senderCount[sender] || 0) + 1;
  });

  let senderArray = Object.keys(senderCount).map(sender => {

    // Try to match text inside < >
    let match = sender.match(/<([^>]+)>/);

    // If a match is found, use it; otherwise use the original string
    let email = match ? match[1] : htmlspecialchars(sender);

    let domain = email.split('.')
    domain = domain.slice(domain.length - 2).join('.')

    if (domain.indexOf('@') != -1) {
      domain = domain.split('@')
      domain = domain.slice(domain.length - 1)[0];
    }

    return { sender, count: senderCount[sender], email, domain  };
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
