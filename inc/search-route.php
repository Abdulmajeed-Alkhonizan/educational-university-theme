<?php 

add_action('rest_api_init', 'universityRegisterSearch');

function universityRegisterSearch(){
    register_rest_route('university/v1', 'search', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'universitySearchResults'
    ));
}

//this function is responsible to display all kinds of information in search overlay (posts, events, professors...)
function universitySearchResults($data){
    // this var contains all different kind of posts type by helping WP_Query method which is responsible for fetching the post type that selected.
    $mainQuery = new WP_Query(array(
        'post_type' => array('post', 'page', 'professor', 'program', 'campus', 'event'),
        's' => sanitize_text_field($data['term']) //this provide extra security against injections
    ));

    //this var creats an array that holds specific info that we want from genrated JSON by WordPress so we can use it in search overlay
    $results = array(
        'generalInfo' => array(),
        'professors' => array(),
        'programs' => array(),
        'events' => array(),
        'campuses' => array()
    );  

    //this loop goes through the different kind of posts type and and fetching them depending on given search term
    while($mainQuery->have_posts()){
        $mainQuery->the_post();
        //array_push(#array, #info) is PHP tool that helps you to add new item to an exsisting array with a desired information that you want to add to that appropriate array
        if(get_post_type() == 'post' OR get_post_type() == 'page'){
            array_push($results['generalInfo'], array(
                'title' => get_the_title(),
                'link' => get_the_permalink(),
                'postType' => get_post_type(),
                'authorName' => get_the_author()
            ));
        }

        if(get_post_type() == 'professor'){
            array_push($results['professors'], array(
                'title' => get_the_title(),
                'link' => get_the_permalink(),
                'image' => get_the_post_thumbnail_url(0, 'professorLandscape')
            ));
        }

        if(get_post_type() == 'program'){
            array_push($results['programs'], array(
                'title' => get_the_title(),
                'link' => get_the_permalink(),
                'id' => get_the_id()
            ));
        }

        if(get_post_type() == 'event'){
            $eventDate = new DateTime(get_field('event_date'));
            $description = null;
            if(has_excerpt()){
                $description = get_the_excerpt();
            } else {
              $description = wp_trim_words(get_the_content(), 15);
            }

            array_push($results['events'], array(
                'title' => get_the_title(),
                'link' => get_the_permalink(),
                'month' =>$eventDate->format('M'),
                'day' =>$eventDate->format('d'),
                'description' => $description
            ));
        }

    }

    //this if statment is responsible for fetching data that are having relationship, e.g (biology program has relationship with professors and events).
    if($results['programs']){
        $programMetaQuery = array('relation' => 'OR');

        
        foreach ($results['programs'] as $item) {
        array_push($programMetaQuery, array(
            'key' => 'related_programs',
            'compare' => 'LIKE',
            'value' => '"'. $item['id'] .'"'
        ));
        }   

        $programRelationshipQuery = new WP_Query(array(
            'post_type' => array('professor', 'event'),
            'meta_query' => $programMetaQuery
        ));

        while($programRelationshipQuery->have_posts()){
            $programRelationshipQuery->the_post();

            if(get_post_type() == 'professor'){
                array_push($results['professors'], array(
                    'title' => get_the_title(),
                    'link' => get_the_permalink(),
                    'image' => get_the_post_thumbnail_url(0, 'professorLandscape')
                ));
            }

            if(get_post_type() == 'event'){
                $eventDate = new DateTime(get_field('event_date'));
                $description = null;
                if(has_excerpt()){
                    $description = get_the_excerpt();
                } else {
                  $description = wp_trim_words(get_the_content(), 15);
                }
    
                array_push($results['events'], array(
                    'title' => get_the_title(),
                    'link' => get_the_permalink(),
                    'month' =>$eventDate->format('M'),
                    'day' =>$eventDate->format('d'),
                    'description' => $description
                ));
            }
        }

        $results['professors'] = array_values(array_unique($results['professors'], SORT_REGULAR));
        $results['events'] = array_values(array_unique($results['events'], SORT_REGULAR));
    }

    return $results;
}