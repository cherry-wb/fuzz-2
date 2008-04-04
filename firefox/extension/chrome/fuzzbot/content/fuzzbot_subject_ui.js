/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */
var gFuzzbotButtonWidth = 12;

/**
 * Gets the absolute X and Y position of an element on the page.
 *
 * @return an array containing an [X, Y] position of the given element
 */
function getElementPosition(element)
{
	var curleft = 0;
   var curtop = 0;

   if(element.offsetParent)
   {
      do 
      {
         curleft += element.offsetLeft;
         curtop += element.offsetTop;
		}
      while(element = element.offsetParent);
   }

	return [curleft, curtop];
}

/**
 * Gets all of the subject elements in the current document.
 */
function getAllSubjectElements()
{
   var cdoc = gBrowser.contentDocument;
   var subjectElements = new Array();
   var element;
   var i = 0;
   
   while(element = cdoc.getElementsByTagName('*')[i++])
   {
      if(element.hasAttributes())
      {
         if(element.getAttribute('about'))
         {
            subjectElements.push(element);
         }
      }
   }

   return subjectElements;
}

/**
 * Generates the subject display given an element and a subject.
 *
 * @param element The element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function generateSubjectDisplay(element, subject)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var fuzzbotSubjectButton = element;
   var position = getElementPosition(fuzzbotSubjectButton);
   var tableIdString = element.getAttribute('id') + "-table";

   // Create the display table
   var rval = cdoc.createElement('div');
   rval.setAttribute("id", tableIdString);
   rval.style.background = "#dcdad5";
   rval.style.position = "absolute";
   rval.style.top = position[1] + "px";
   rval.style.left = 
      (position[0] + gFuzzbotButtonWidth + 16) + "px";
   rval.style.width = 
      (winWidth - (position[0] + gFuzzbotButtonWidth)) + "px";
   
   // Retrieve all of the display-able values
   // TODO: This needs to be broken out into a more modular architecture
   var name = 0;
   var depiction = 0;
   var type = 0;
   var dctitle = 0;
   var dcabstract = 0;
   for(var i in gTripleStore[subject])
   {
      var triple = gTripleStore[subject][i];
      
      _fuzzbotLog(subject + ": " + triple.predicate + " " + triple.object);
      
      if(triple.predicate == "http://xmlns.com/foaf/0.1/name")
      {
         name = triple.object;
      }
      if(triple.predicate == "http://xmlns.com/foaf/0.1/depiction")
      {
         depiction = triple.object;
      }
      if((triple.predicate ==
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"))
      {
         type = triple.object;
      }
      if(triple.predicate == "http://purl.org/dc/elements/1.1/title")
      {
         dctitle = triple.object;
      }
      if(triple.predicate == "http://purl.org/dc/terms/abstract")
      {
         dcabstract = triple.object;
      }
   }

   // Display the title
   var h1 = cdoc.createElement('h1');
   h1.style.fontWeight = "bold";
   h1.style.margin = 0;
   h1.style.textAlign = "center";
   h1.style.padding = "5px";
   h1.style.fontSize = "16px";
   h1.style.backgroundImage = "url(chrome://fuzzbot/content/tabpanel-top.png)";
   h1.style.backgroundPosition = "top";
   h1.style.backgroundRepeat = "repeat-x";

   var h1text = cdoc.createTextNode("Unknown");
   if(name)
   {
      h1text = cdoc.createTextNode(name);
   }
   else if(dctitle)
   {
      h1text = cdoc.createTextNode(dctitle);
   }
   h1.appendChild(h1text);
   rval.appendChild(h1);

   // Display the image if it exists
   if(depiction)
   {
      var imgdiv = cdoc.createElement('div');
      imgdiv.style.textAlign = "center";
      imgdiv.style.backgroundImage =
         "url(chrome://fuzzbot/content/tabpanel-middle.png)";
      imgdiv.style.backgroundPosition = "left";
      imgdiv.style.backgroundRepeat = "repeat-y";
   
      var img = cdoc.createElement('img');
      img.width = "200";
      img.setAttribute("src", depiction);
      img.style.marginLeft = "auto";
      img.style.marginRight = "auto";
      
      imgdiv.appendChild(img);
      rval.appendChild(imgdiv);
   }
   
   // Display the main body of the tab
   var divbody = cdoc.createElement('div');
   divbody.style.padding = "0 10px";
   divbody.style.backgroundImage =
      "url(chrome://fuzzbot/content/tabpanel-middle.png)";
   divbody.style.backgroundPosition = "left";
   divbody.style.backgroundRepeat = "repeat-y";
   rval.appendChild(divbody);

   if(type == "http://xmlns.com/foaf/0.1/Person")
   {
      // Display the actions available via this tab
      var form = cdoc.createElement('form');
      var select = cdoc.createElement('select');
      var homepage_option = cdoc.createElement('option');
      var email_option = cdoc.createElement('option');
      var skype_option = cdoc.createElement('option');
      var vcard_export_option = cdoc.createElement('option');

      form.style.textAlign = "center";
      form.style.padding = "5px 0";
      homepage_option.setAttribute("disabled", true);
      homepage_option.setAttribute("selected", true);
      homepage_option.appendChild(cdoc.createTextNode("Go to Homepage"));
      email_option.setAttribute("disabled", true);
      email_option.appendChild(cdoc.createTextNode("E-mail"));
      skype_option.setAttribute("disabled", true);
      skype_option.appendChild(cdoc.createTextNode("Call via Skype"));
      vcard_export_option.setAttribute("disabled", true);
      vcard_export_option.appendChild(
         cdoc.createTextNode("Add to Addressbook"));

      select.appendChild(homepage_option);
      select.appendChild(email_option);
      select.appendChild(skype_option);
      select.appendChild(vcard_export_option);
      form.appendChild(select);
      divbody.appendChild(form);
   }

   // display an abstract if needed
   if(dcabstract)
   {
      var p = cdoc.createElement('p');
      p.style.clear = "left";
      p.innerHTML = dcabstract;
      divbody.appendChild(p);
   }
   
   // Display the bottom of the tab
   var divbottom = cdoc.createElement('div');
   divbottom.style.height = "2px";
   divbottom.style.backgroundImage =
      "url(chrome://fuzzbot/content/tabpanel-bottom.png)";
   divbottom.style.backgroundPosition = "bottom";
   divbottom.style.backgroundRepeat = "repeat-x";
   rval.appendChild(divbottom);

   return rval;
}

/**
 * Handles a click event in the DOM.
 *
 * @param event The click event that occurred in the DOM.
 */
function fuzzbotHandleClickEvent(event)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var element = event.target;
   var subject = element.getAttribute('title');
   var position = getElementPosition(element);

   if((winWidth - position[0]) < 100)
   {
      fuzzbotDisplaySubject(element, subject);
   }
   else
   {
      fuzzbotHideSubject(element, subject);
   }
}

/**
 * Hides the Fuzzbot UI for a given subject.
 *
 * @param element The element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function fuzzbotHideSubject(element, subject)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var fuzzbotSubjectButton = element;
   var tableId = element.getAttribute('id') + "-table";
   var fuzzbotSubjectDisplay = cdoc.getElementById(tableId);

   cdoc.body.removeChild(fuzzbotSubjectDisplay);
   fuzzbotSubjectButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
}

/**
 * Displays a more complete Fuzzbot UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject string for the triples to fetch from the triple
 *                store.
 */
function fuzzbotDisplaySubject(element, subject)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var winHeight = cdoc.body.clientHeight;
   var fuzzbotSubjectButton = element;
   var horizontalShift = (winWidth / 5);

   // move the button to the left
   if(horizontalShift < 200)
   {
      horizontalShift = 200;
   }
   fuzzbotSubjectButton.style.left = (winWidth - horizontalShift) + "px";

   // display the details panel
   var fuzzbotSubjectDisplay = generateSubjectDisplay(element, subject);
   cdoc.body.appendChild(fuzzbotSubjectDisplay);
}

   
/**
 * Adds Fuzzbot Actions to all of the current elements on the page.
 */
function addFuzzbotMarkup()
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var winHeight = cdoc.body.clientHeight;
   var subjectElements = getAllSubjectElements();

   for(var i = 0; i < subjectElements.length; i++)
   {
      var element = subjectElements[i];
      var idString = "fuzzbot-button-" + i;
      var subject = cdoc.URL + element.getAttribute('about');
      var position = getElementPosition(element);
      
      var fuzzbotUiButton = cdoc.createElement('img');
      fuzzbotUiButton.setAttribute("id", idString);
      fuzzbotUiButton.setAttribute("src",
         "chrome://fuzzbot/content/ltab_open.png");
      fuzzbotUiButton.setAttribute("alt", subject);
      fuzzbotUiButton.setAttribute("title", subject);

      fuzzbotUiButton.addEventListener(
         "click", fuzzbotHandleClickEvent, false);
      
      fuzzbotUiButton.style.position = "absolute";
      fuzzbotUiButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
      fuzzbotUiButton.style.top = (position[1] - 8) + "px";
      cdoc.body.appendChild(fuzzbotUiButton);
   }
}

/**
 * Removes all Fuzzbot UI elements from the page.
 */
function removeFuzzbotMarkup()
{
   var cdoc = gBrowser.contentDocument;
   var elementFound = false;
   var i = 0;

   do
   {
      var idString = "fuzzbot-button-" + i;
      var fuzzbotUiButton = cdoc.getElementById(idString);

      if(fuzzbotUiButton)
      {
         elementFound = true;
         cdoc.body.removeChild(fuzzbotUiButton);
      }
      else
      {
         elementFound = false;
      }
      i++;
   }
   while(elementFound);
}
