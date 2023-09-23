var isChrome = (chrome.action != null && chrome.action != undefined);

let initTimerId = 0;

const furnitureURL = "https://genshinguide-318.web.app/file1.txt"
const furnitureInHouseURL = "https://genshinguide-318.web.app/file2.txt"

let bLoaded = false;
let furnishings = [];
let furnishings_inhouse = [];
let fCount = 0;

let currentFloat = 0;

//初期化
function initializing() {
  console.log("GFurniture Init Start");

  var mo = new MutationObserver(function () {
    let drawer = document.querySelector(".furniture-drawer");
    let avatars = drawer.querySelectorAll(".common-avatar");

    for (let i = 0; i < avatars.length; i++) {
      let a = avatars[i];

      if (a.hasAttribute("data-furniture")) continue;

      a.setAttribute("data-furniture", ++fCount);

      a.addEventListener('mousemove', function (e) {
        let eId = e.currentTarget.getAttribute("data-furniture");
        if (currentFloat == eId) return;
        currentFloat = eId;

        //console.log("GFurniture mouseenter");
        let takenElement = document.querySelector(".furniture_taken");
        if (takenElement == null) return;

        let innerName = e.currentTarget.querySelector(".common-avatar__inner-name");

        let fName = getConvertedName(innerName.textContent);

        let selectFurniture = getFurnishingByName(fName);

        var takenText = "負荷：" + (selectFurniture != null ? selectFurniture.Taken : "不明");
        if (selectFurniture != null) {
          var reduceTaken = "未計測";
          if (selectFurniture.Reduce == "〇") {
            reduceTaken = selectFurniture.ReduceTaken;
          }
          else if (selectFurniture.Reduce == "×") {
            reduceTaken = "×";
          }
          takenText += " 軽減負荷：" + reduceTaken;
        }

        takenElement.innerText = takenText;
      });
    }
    console.log("avatars:" + avatars.length + " fCount:" + fCount);
  });
  var config = {
    childList: true,
    subtree: true, //対象ノードとその子孫ノードに対する変更の監視を有効に
  };

  let tooltip = document.querySelector(".float-tooltip__info");

  let takenElement = document.createElement("div");
  takenElement.style.fontSize = "12px";
  takenElement.style.color = "#333b50";
  takenElement.style.lineHeight = "16px";
  takenElement.style.marginBottom = "4px";
  takenElement.setAttribute("class", "furniture_taken");

  tooltip.appendChild(takenElement);

  let drawer = document.querySelector(".furniture-drawer");
  mo.observe(drawer, config);

  var cart_config = {
    childList: true,
    characterData: true,
    subtree: true, //対象ノードとその子孫ノードに対する変更の監視を有効に
  };
  var mo_cart = new MutationObserver(cartObserve);
  let cal_right = document.querySelector(".calculate__right");
  mo_cart.observe(cal_right, cart_config);
}

function cartObserve(mutations) {
  let bAddItemTaken = false;
  mutations.forEach(mutation => {
    console.log(mutation);
    mutation.addedNodes.forEach(addedNode => {
      if (addedNode.nodeType === 1 && addedNode.classList.contains("item-taken")) {
        bAddItemTaken = true;
      }
    });
    if (mutation.type == "childList" && mutation.target.classList.contains("item-taken")) {
      bAddItemTaken = true;
    }
  });
  console.log("mutations:" + mutations.length + ":" + bAddItemTaken);
  if (bAddItemTaken) return;


  let footer = document.querySelector(".lt-footer");
  if (footer == null) return;
  let takensElement = footer.querySelector(".furniture_takens");
  if (takensElement == null) {
    takensElement = document.createElement("div");
    takensElement.style.fontSize = "12px";
    takensElement.style.color = "#333b50";
    takensElement.style.lineHeight = "16px";
    takensElement.style.marginBottom = "4px";
    takensElement.setAttribute("class", "furniture_takens");

    footer.insertBefore(takensElement, footer.firstChild);
  }

  let cart_list = document.querySelector(".furniture-cart__list");
  let cart_items = cart_list.querySelectorAll(".furniture-cart__item");

  let takens = 0;

  for (let i = 0; i < cart_items.length; i++) {
    let itemName = cart_items[i].querySelector(".item-name");
    let itemTaken = cart_items[i].querySelector(".item-taken");
    let itemCount = cart_items[i].querySelector(".item-count");
    if (itemTaken == null) {
      let itemBrock = document.createElement("div");

      itemTaken = document.createElement("div");
      itemTaken.style.fontSize = "12px";
      itemTaken.style.color = "#333b50";
      itemTaken.style.lineHeight = "16px";
      itemTaken.style.marginBottom = "4px";
      itemTaken.setAttribute("class", "item-taken");

      cart_items[i].insertBefore(itemBrock, itemName);

      itemBrock.appendChild(itemName);
      itemBrock.appendChild(itemTaken);
    }
    let fName = getConvertedName(itemName.textContent);
    let fCount = parseInt(itemCount.textContent);
    let selectFurniture = getFurnishingByName(fName);

    if (selectFurniture == null) {
      itemTaken.innerText = "不明";
      continue;
    }

    let taken = selectFurniture.Taken;

    if (fCount > 1) {
      if (selectFurniture.Reduce == "〇") {
        taken += selectFurniture.ReduceTaken * (fCount - 1);
      }
      else {
        taken += selectFurniture.Taken * (fCount - 1);
      }
    }
    takens += taken;

    itemTaken.innerText = "負荷:" + (Math.round(taken * 100) / 100);
  }

  takensElement.innerText = "参考負荷値：" + (Math.round(takens * 100) / 100);
}

function getFurnishingByName(name) {
  for (var i = 0; i < furnishings.length; i++) {
    if (furnishings[i].Name == name) return furnishings[i];
  }
  for (var i = 0; i < furnishings_inhouse.length; i++) {
    if (furnishings_inhouse[i].Name == name) return furnishings_inhouse[i];
  }
  return null;
}

function getConvertedName(name) {
  return name.replace(/(·|･|•)/g, "・");
}

function findTargetElement() {
  let drawer = document.querySelector(".furniture-drawer");
  if (drawer == null) return;

  clearInterval(initTimerId);
  initializing();
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

if (document.readyState !== "loading") {
  load();
} else {
  document.addEventListener("DOMContentLoaded", load, false);
}

function load() {
  const sending = chrome.runtime.sendMessage({ mode: 'load-furniture', url: furnitureURL });
  const sending_inhouse = chrome.runtime.sendMessage({ mode: 'load-furniture-inhouse', url: furnitureInHouseURL });
  sending.then(function (message) {
    console.log(message);
  }, handleError);
  sending_inhouse.then(function (message) {
    console.log(message);
  }, handleError);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.mode) {
    case 'loaded-furniture':
      {
        furnishings = JSON.parse(message.response);
        if (bLoaded) {
          initTimerId = setInterval(findTargetElement, 300);
        }
        bLoaded = true;
      }
      break;
    case 'loaded-furniture-inhouse':
      {
        furnishings_inhouse = JSON.parse(message.response);
        if (bLoaded) {
          initTimerId = setInterval(findTargetElement, 300);
        }
        bLoaded = true;
      }
      break;
    default:
      sendResponse({ response: "no match mode." });
      break;
  }
  sendResponse({ response: "send complete." });
});