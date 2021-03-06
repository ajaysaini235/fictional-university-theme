<?php
    /* 
        single.php - individual posts
        page.php - individual pages
    */
    get_header();
    pageBanner();
    while(have_posts()){
        the_post();?>
        <div class="container container--narrow page-section">
            <div class="metabox metabox--position-up metabox--with-home-link">
                <!-- Self explanatory what get_post_type_archive_link is, but to make it easier to grep if forgotten custom post types can be
                Modified. This makes it dynamic, by grabbing the static custom-post type name, and searching for any rewrites.
                -->
                <p><a class="metabox__blog-home-link" href="<?php echo get_post_type_archive_link('event'); ?>"><i class="fa fa-home" aria-hidden="true"></i> Events Home</a> <span class="metabox__main"> <?php the_title(); ?></span></p>
            </div>
            <div class="generic-content">
                <?php the_content(); ?>
            </div>
            <?php 
                $relatedPrograms = get_field('related_programs');

                if($relatedPrograms){
                    // If you are ever curous what an accessor method (get function) returns, you can type this into php... print_r($relatedPrograms);
                    echo '<hr class="section-break">';
                    echo '<h2 class="headline headline--medium">Related Program(s)</h2>';
                    echo '<ul class="link-list min-list">';
                    foreach($relatedPrograms as $program){ ?>
                        <!-- echos out every single program associated with the event echo get_the_title($program); -->
                        <li><a href="<?php echo get_the_permalink($program); ?>"><?php echo get_the_title($program); ?></a></li>
                    <?php  }
                    echo '</ul>';    
                }
            ?>
        </div>
    <?php }
    get_footer();
?>