<?php 

    if(!is_user_logged_in()) {
        wp_redirect(esc_url(site_url('/')));
        exit;
    }

    get_header();

    while(have_posts()){
        the_post(); 
        pageBanner();
        ?>
       

    <div class="container container--narrow page-section">
        <!-- The classes down here, they will be targeted by javascript to do an action in MyNote.js file -->
        <div class="create-note">
            <h2 class="headline headline--medium">Create New Note</h2>
            <input class="new-note-title" placeholder="Title">
            <textarea class="new-note-body" placeholder="Write new notes here..."></textarea>
            <span class="submit-note">Create note</span>
            <span class="note-limit-message">Note Limit Reached: Delete an existing note to make room for new notes.</span>
        </div>
       <ul class="min-list link-list" id="my-notes">
        <?php $userNotes = new WP_Query(array(
            'post_type' => 'note',
            'posts_per_page' => -1,
            'author' => get_current_user_id()
        )); 
        while($userNotes->have_posts()){
            $userNotes->the_post(); ?>
            <!-- I give the "li" tag an id to get control of it, and can perfourm Delete and Edit actions.
                 within the id attribute, I can get the ID note by entring php and fetch id data while in the loop -->
            <li data-id="<?php the_id(); ?>">
                <input readonly class="note-title-field" value="<?php echo str_replace('Private: ', '', esc_attr(get_the_title())); ?>">
                <span class="edit-note"><i class="fa fa-pencil" aria-hidden="ture"></i>Edit</span>
                <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="ture"></i>Delete</span>
                <textarea readonly class="note-body-field"><?php echo esc_attr(wp_strip_all_tags(get_the_content())); ?></textarea>
                <span class="update-note btn btn--blue btn small"><i class="fa fa-arrow-right" aria-hidden="ture"></i>Save</span>
            </li>
        <?php }
        ?>
       </ul>
    </div>

   <?php }
    get_footer();
?>