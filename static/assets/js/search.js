var converter = new showdown.Converter();
converter.setOption('tables', true);

function replaceHighLight(content){
  var matches;

  do{
    matches = content.match(/\]\(.*?(<span class="highlight_hit">(.*?)<\/span>).*?\)/g);
    if(!matches){
        return content;
    }
    var highlight = /<span class="highlight_hit">(.*?)<\/span>/g;
    var highmatches;
    for(var i=0,z=matches.length;i<z;i++){
      highmatches = highlight.exec(matches[i]);
      if(highmatches)
      content = content.replace(matches[i], matches[i].replace(highmatches[0],highmatches[1]));
    }
  }while(matches!=null)

  return content;
}


/* global instantsearch */
app({
  appId: 'STCFX6MFXG',
  apiKey: '7e5bbfd198172dd34161605ddeecbe0d',
  indexName: 'web_sambo'
});

function app(opts) {
  var search = instantsearch({
    appId: opts.appId,
    apiKey: opts.apiKey,
    indexName: opts.indexName,
    urlSync: true,
    searchFunction : function(helper) {
      if (helper.state.query === '') {
        //return;
      }
      helper.search();
    }
  });

  /*search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#query',
      placeholder: 'Cerca....'
    })
  );*/

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 10,
      templates: {
        item: getTemplate('hit'),
        empty: getTemplate('no-results')
      },
      transformData : function(item){
        var yt;
        if(item.youtube){
          yt = item.youtube.split("/");
          yt = "https://www.youtube.com/embed/"+yt.pop();
          item.youtube = yt;
        }
        return item;
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.stats({
      container: '#stats',
      templates: {
        body: getTemplate('stats')
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.pagination({
      container: '.footer_pagination',
      autoHideContainer: true,
      //scrollTo: '#query',
      showFirstLast : true,
      maxpages : 10,
      labels: {
        previous : "<",
        next : ">",
        first: "<<",
        last : ">>"
      },
      cssClasses : {
        root : "pagination",
        item : "page-item",
        link : "page-link",
        disabledItem : "disabled", 
        selectedItem: "active",
        first : "",
        last : "",
        page : ""
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '.tags ul',
      attributeName: 'tags',
      autoHideContainer: true,
      limit: 10,
      operator: 'or',
      templates: {
        header: getHeader(),
        item: getTemplate('tag')
      },
      transformData : {
      }
    })
  )

  search.start();
}

function getTemplate(templateName) {
  return document.querySelector('#' + templateName + '-template').innerHTML;
}

function getHeader(title) {
  return title;
  //return '<h5>' + title + '</h5>';
}

// Pagination modification
function observe(){
  var body = document.getElementsByTagName('body')[0];
  var config = { attributes: true, childList: true, subtree: true };
  var observer = new MutationObserver(function() {
      var resultsContainer = document.querySelector('.footer_pagination span');
      if(resultsContainer){
        $(".pagination li span").each(function(i, el){
          $('<a class="page-link disabled">'+$(el).text()+'</a>').appendTo($(el).parent());
          $(el).remove();
        });
        if($(".pagination li").length===5){
          $(".footer_pagination").css("display", "none");
        }
        observer.disconnect();
      }
  });
  observer.observe(body, config);
}

observe();

//Search query
var searchterms = window.location.search.replace("?","").split("&");
var term;
for(var i=0,z=searchterms.length;i<z;i++){
  term = searchterms[i].split("=");
  if(term[0]==="q"){
    $("#q").val(term[1]);
    break;
  }
}