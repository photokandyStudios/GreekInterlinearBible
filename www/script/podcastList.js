
/************************************************************************************
 *
 * podcastStream object
 *
 * Constructor: userID [, template] ,container [,followLink] [,avatarImage]
 *      Creates a podcastStream object ready to populate the specified container.
 *      userId is the unique identifier for the podcast user.
 *      template (optional) specifies the template to use when rendering the tweets.
 *      container specifies the container in which to render the tweets.
 *      followLink (optional) points to the link that should be set to the user's
 *          profile.
 *      avatarImage (optional) points to the image that should be set to the user's
 *          avatar image.
 *
 * podcastItem ( o ):
 *      Called by loadpodcast() when the json is returned by podcast. This processes
 *      each entry and uses a template to construct the HTML. Valid placeholders are
 *      %TEXT%, %TIME%.
 *      The first iteration also sets the avatarImage (if defined), and the
 *      followLink (if defined).
 *      When complete, the container's innerHTML is set, the scrollbars are reset,
 *      and the loader is hidden.
 *
 * loadpodcast ( c ):
 *      Starts loading the podcastStream with <c> items. c can be any number from 1
 *      to 200. (podcast limits the stream to 200.) Once called, it constructs a
 *      json request to podcast, shows the Loader, and ends. When podcast returns,
 *      it will call podcastItem () with the results to finish the transaction.
 *      NOTE: If podcast fails to respond in a timely fashion, the loader will
 *      hide automatically.
 *      
 *
 * Copyright 2011 photoKandy Studios LLC
 * Portions used and modified from other sources where noted.
 * ----------------------------------------------------------
 * This code is hereby released under the Creative Commons Share-and-Share-Alike Attribution License v3.
 * This means you can freely use the code in your commercial and non-commercial applications, but you must
 * provide any changes back to the community, and you must indicate that we are the original creators.
 * -------------------------------------------------------------------------------------------------------
 *
 ***********************************************************************************/
 
function podcastStream ( name, url, template, container, fileType )
{
    this.name = name; // we have to know the name in order to construct the callback
    
    this.podcastUrl = url;
                        
    this.podcastItemCount = 25;
    
    this.podcastTemplate = template ? template : '%TEXT% %LINK% (%TIME% ago)<br />';
    
    this.podcastContainer = $(container);
    this.podcastFileType = fileType;
    
    this.podcastProfile = 'https://plus.google.com/' + this.podcastUrl + '/posts';
    this.podcastJSONUri = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=' + this.podcastUrl +'&callback=' + this.name + '.podcastItem';
    
    this.podcastItem = function ( rd )
    {
        var ihtml = "";
        var item = "";
        o = rd.responseData.feed;
        for (i=0;i<o.entries.length;i++)
        {
            item = this.podcastTemplate;
            item = item.replace ( "%TITLE%", o.entries[i].title );
            item = item.replace ( "%TEXT%", o.entries[i].contentSnippet );
            item = item.replace ( "%TIME%", ago(o.entries[i].publishedDate) );
            item = item.replace ( "%LINK%", o.entries[i].link );
            
            if (o.entries[i].mediaGroups)
            {
                // find a supported type (mp4)
                var MG = 0;
                var MGC = 0;
                for (j=0;j<o.entries[i].mediaGroups.length;j++)
                {
                    MGC = 0;
                    for (k=0;k<o.entries[i].mediaGroups[j].contents.length;k++)
                    {
                        if (o.entries[i].mediaGroups[j].contents[k].url.lastIndexOf ( this.podcastFileType ) >=
                            o.entries[i].mediaGroups[j].contents[k].url.length - this.podcastFileType.length - 5)
                        {
                            MG = j;
                            MGC = k;
                        }
                    }
                }
                item = item.replace ( "%MEDIA:URL%", o.entries[i].mediaGroups[MG].contents[MGC].url );
                item = item.replace ( "%MEDIA:LENGTH%", Math.round(o.entries[i].mediaGroups[MG].contents[MGC].duration / 60));
            }
            
            ihtml = ihtml + item;
            
        }
        
        this.podcastContainer.innerHTML = ihtml;
        resetContentScrollBar();
        hideLoader();
        return false;
    }
    
    this.loadpodcast = function(c)
    {
        showLoader();
        var myJSON = document.createElement ("script");
        myJSON.type = "text/javascript";
        myJSON.src = this.podcastJSONUri + "&num=" + c;
        $("pnlBodyArea").appendChild (myJSON);
        return false;
    }
    
}