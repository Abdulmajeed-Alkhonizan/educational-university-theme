<?php 

/*This file recieves a http requset from "Like.js" 'Located in Modules folder', it recives a data that I want to send from that file using ajax method. 
I send a data that specifies what kind of action I wanna do, whether a create like or remove one.
most importanatly when a user clicks on heart icon to Like a professor or removes a like then this file will be triggerd and already receiving data that contains an action to do.
*/
add_action('rest_api_init', 'universityLikeRoutes');

/*  registering a new api route to power the like feature.
    parameters of register_rest_route are
    register_rest_route(
        para1 & para2 => name of the url that I want to create when a user tries to Delete or Create a like

        para3 => the action that I want to provide 
    )
*/
function universityLikeRoutes() {
    register_rest_route('university/v1', 'manageLike', array(
        'methods' => 'POST',
        'callback' => 'createLike',
    ));

    register_rest_route('university/v1', 'manageLike', array(
        'methods' => 'DELETE',
        'callback' => 'deleteLike',
    ));
}

//Creating a like by PHP using wp_insert_post() method, first I targeted post type of "like". 
//Then this method takes values and create new post based on that values for that selected post type.
function createLike($data) {
    //Validating if the user logged in or not by using NONCE attribute in Like.js when sending a requset.
    if(is_user_logged_in()) {
        //Here I can fetch the id by targeting "span" tag in single-professor.php file. Commmented there.
        $professorID = sanitize_text_field($data['professorID']);
        $existQuery = new WP_Query(array(
            'author' => get_current_user_id(),
            'post_type' => 'like',
            'meta_query' => array(
                array(
                    'key' => 'liked_professor_id',
                    'compare' => '=',
                    'value' => $professorID
                )
            )
        ));

        if($existQuery->found_posts == 0 AND get_post_type($professorID) == 'professor'){ 
            return wp_insert_post(array(
                'post_type' => 'like',
                'post_status' => 'publish',
                'post_title' => 'a like created',
                'meta_input' => array(
                    'liked_professor_id' => $professorID
                )
            ));
        } else {
            die("Invalid professor id");
        }

    } else {
        die("Only logged in user can make a like");
    }
}

function deleteLike($data) {
    //Here I can fetch the like id by targeting "span" tag and look for attribute (data-like). 
    //this span tag in single-professor.php file. Commmented there.
    $likeId = sanitize_text_field($data['like']);
    if(get_current_user_id() == get_post_field('post_author', $likeId) AND get_post_type($likeId) == 'like') {
        wp_delete_post($likeId, true);
        return 'Like removed';
    } else {
        die("You don't have a permission to remove a like.");
    }
    
}
