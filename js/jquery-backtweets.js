(function($) {
    $.backtweetsCallbacks = [];
    $.fn.backtweets = function(options) {
        
        var defaults = {
            q: window.location.href.replace(/[\?#].*$/, ''),
            key: '',
            page: 1,
            itemsperpage: 25,
            start: '',
            end: '',
            prepareTweet: function(tweet) { },
            getFriendlyURL: function(url) { return url; },
            handleInvalidProfileImage: function($img) { }
        };
        
        options = $.extend(defaults, options);
    
        return this.each(function() {
            var $self = $(this);
            var $tweetTemplate = $('.template', $self);
            var $tweetContainer = $tweetTemplate.parent();
            var $moreTweetsButton = $('.more-backtweets-button', $self);
            var $queryLabel = $('.backtweet-query-site', $self);
            var $numberOfBacktweetsLabel = $('.backtweet-results-total', $self);
            var $numberOfBacktweetsLoadedLabel = $('.backtweet-results-current', $self);
            var numberOfBacktweetsLoaded = 0;
            
            function ProcessBacktweets(data) {
                // process each tweet    
                for (var i = 0 ; i < data.tweets.length ; i++) {
                    var clone = $tweetTemplate.clone().removeClass('template').show();
                    var tweet = data.tweets[i];
                    // support customization
                    options.prepareTweet(tweet);
                    // populate the clone
                    $('.tweet_prop.tweet_profile_image_url', clone).html(tweet.tweet_profile_image_url);
                    $('.tweet_prop.tweet_from_user', clone).html(tweet.tweet_from_user);
                    $('.tweet_prop.tweet_text', clone).html(tweet.tweet_text);
                    $('.tweet_prop.tweet_create_at', clone).html(tweet.tweet_create_at);
                    // support customization
                    $('.tweet_prop.tweet_text a', clone).each(function() {
                        $(this).text(options.getFriendlyURL($(this).attr('href')));
                    });
                    // handle invalid image urls
                    $('.tweet_prop.tweet_profile_image_url img', clone).error(function () {
                        options.handleInvalidProfileImage($(this));
                    });
                    $tweetContainer.append(clone);
                    numberOfBacktweetsLoaded++;
                }
                // update ui
                var isLastResultSet = (data.tweets.length === 0 || numberOfBacktweetsLoaded == data.totalresults);
                $moreTweetsButton.removeAttr('disabled').toggleClass('disabled', isLastResultSet);
                $numberOfBacktweetsLabel.text(data.totalresults);
                $numberOfBacktweetsLoadedLabel.text(numberOfBacktweetsLoaded);
            }
            
            function RequestBacktweets() {
                // update the UI
                $moreTweetsButton.attr('disabled', 'disabled').addClass('disabled');
                // support multiple callbacks
                var callbackIndex = $.backtweetsCallbacks.push(function(data){
                    ProcessBacktweets(data);
                    $.backtweetsCallbacks[callbackIndex - 1] = undefined;
                });
                // call the backtweets service
                $.getScript(
                    'http://backtweets.com/search.json' +
                    '?q=' + encodeURI(options.q) +
                    '&key=' + encodeURI(options.key) +
                    '&page=' + encodeURI(options.page) +
                    '&itemsperpage=' + encodeURI(options.itemsperpage) +
                    '&start=' + encodeURI(options.start) +
                    '&end=' + encodeURI(options.end) +
                    '&callback=' + encodeURI('$.backtweetsCallbacks[' + (callbackIndex - 1) + ']')
                );
                // we've advanced a page
                options.page++;
            }

            $moreTweetsButton.click(function() {
                RequestBacktweets();
                return false;
            });

            // init
            $queryLabel.text(options.q);
            RequestBacktweets();
        });
    };
})(jQuery);