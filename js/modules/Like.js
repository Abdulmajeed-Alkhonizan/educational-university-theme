import $ from 'jquery';

class Like {
    constructor() {
        this.events();
    }

    events() {
        $(".like-box").on("click", this.clickDispatcher.bind(this));
    }

    /*
    This method decides which action should be done, based on the professor id whether it's already clicked "liked" or remove "delete" a like.
    Anyway, I need to pass the professor id to function that been triggerd and include it to the request that would be sent to rset api.
    since I include the professor id in html tag "span" in snigle-professor.php file "commented there", now I can fetch the id by targeting that tag and retrieve the id.
    */
    clickDispatcher(e) {
        var currentLikeBox = $(e.target).closest(".like-box");
        //passing currentLikeBox var to these functions to fetch professor id when a function sends the request.
        if(currentLikeBox.attr('data-exists') == 'yes') {
            this.deleteLike(currentLikeBox);
        } else {
            this.createLike(currentLikeBox);
        }
    }

    /*
    In either function (createLike) OR (deleteLike), **MUST** send with the request a (NONCE) attribute.
    Because WordPress validates if the user logs then go ahead and do the action.
    But if the user NOT logged in then ignore the action.
    */
    createLike(currentLikeBox) {
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
            },
            url: universityData.root_url + '/wp-json/university/v1/manageLike',
            type: 'POST',
            //In data, I need to send a data that tells WordPress which id I want to delete.
            //can be fetched by targeting span tag in single-professor.php and look for professor id.
            data: {'professorID' : currentLikeBox.data('professor')},
            /*In success I targeted an attribute that handles like counts.
            So, in success with each created like that successed then I will target the attribute that handles like counts and increment it by 1.*/
            success: (response) => {
                currentLikeBox.attr('data-exists', 'yes');
                var likeCount = parseInt(currentLikeBox.find(".like-count").html(), 10);
                likeCount++;
                currentLikeBox.find(".like-count").html(likeCount);
                currentLikeBox.attr("data-like", response);
                console.log(response);
            },
            error: (response) => {
                console.log(response);
            }
        });
    }

    deleteLike(currentLikeBox) {
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
            },
            url: universityData.root_url + '/wp-json/university/v1/manageLike',
            //In data, I need to send a data that tells WordPress which id I want to delete.
            //can be fetched by targeting span tag in single-professor.php and look for like id.
            data: {'like' : currentLikeBox.attr('data-like')},
            type: 'DELETE',
            success: (response) => {
                currentLikeBox.attr('data-exists', 'no');
                var likeCount = parseInt(currentLikeBox.find(".like-count").html(), 10);
                likeCount--;
                currentLikeBox.find(".like-count").html(likeCount);
                currentLikeBox.attr("data-like", '');
                console.log(response);
            },
            error: (response) => {
                console.log(response);
            }
        });
    }

    
}

export default Like;