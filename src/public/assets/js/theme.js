// -----------------------------

//   js index
/* =================== */
/*  
    

    

*/
// -----------------------------


(function ($) {
    "use strict";

    /*---------------------
    handler
    --------------------- */
    $(window).on('load', function () {
        nhPreloader();
        bpMenuareaFixed();
        bpMenuareaFixed2();
        bpMenuareaFixed3();
        bpCounterUphendle();
    });

    /*---------------------
    preloader
    --------------------- */
    function nhPreloader() {
        if ($('#preloader').length) {
            $('#preloader').fadeOut('slow', function () {
                $(this).remove();
            });
        }
    }

    /*------------------------------
         counter
    ------------------------------ */
    function bpCounterUphendle() {
        $('.counter-up').counterUp();
    };


    /*---------------------
    team-progress
    --------------------- */
    $('.all-progess').waypoint(function () {
        $('.progress-bar').addClass('left-anim');
    }, {
        triggerOnce: true,
        offset: '50%'
    });

    /*----------------------------
     jQuery MeanMenu
    ------------------------------ */
    $('nav#dropdown').meanmenu();

    /*-----------------
    meanmenu 
    -----------------*/
    $('nav#mobile_menu_active').meanmenu({
        meanScreenWidth: "991",
        meanMenuContainer: '.menu',
    });

    /*------------------------
    meanmenu-remove-class
    ------------------------*/
    $(window).on('resize', function () {
        var wWidth = $(this).width();

        if (wWidth < 991) {
            // removing class
            $('.drop').addClass('m-d-removed');
            $('.m-d-removed').removeClass('drop');

            $('.third').addClass('t-h-m-removed');
            $('.t-h-m-removed').removeClass('third');

            $('.mega-menu').addClass('m-g-removed');
            $('.m-g-removed').removeClass('mega-menu');
        } else {
            // adding class
            $('.m-d-removed').addClass('drop');
            $('.drop').removeClass('m-d-removed');

            $('.third').removeClass('t-h-m-removed');
            $('.t-h-m-removed').addClass('third');

            $('.mega-menu').removeClass('m-g-removed');
            $('.m-g-removed').addClass('mega-menu');
        }
    }).resize();

    /*-----------------
    home 1 sticky
    -----------------*/
    function bpMenuareaFixed() {
        if ($('.menu-area').length) {
            $(window).on('scroll', function () {
                if ($(window).scrollTop() > 140) {
                    $('.menu-area').addClass('navbar-fixed-top');
                } else {
                    $('.menu-area').removeClass('navbar-fixed-top');
                }
            });
        }
    }

    /*-----------------
    home 2 sticky
    -----------------*/
    function bpMenuareaFixed2() {
        if ($('.h2-menu-area').length) {
            $(window).on('scroll', function () {
                if ($(window).scrollTop() > 200) {
                    $('.h2-menu-area').addClass('navbar-fixed-top');
                } else {
                    $('.h2-menu-area').removeClass('navbar-fixed-top');
                }
            });
        }
    }

    /*-----------------
    home 3 sticky
    -----------------*/
    function bpMenuareaFixed3() {
        if ($('.h3-menu-area').length) {
            $(window).on('scroll', function () {
                if ($(window).scrollTop() > 140) {
                    $('.h3-menu-area').addClass('navbar-fixed-top');
                } else {
                    $('.h3-menu-area').removeClass('navbar-fixed-top');
                }
            });
        }
    }

    /*-----------------
    scroll-up
    -----------------*/
    $.scrollUp({
        scrollText: '<i class="fa fa-arrow-up" aria-hidden="true"></i>',
        easingType: 'linear',
        scrollSpeed: 1500,
        animation: 'fade'
    });


    /*---------------------
    smooth scroll
    --------------------- */
    $('.smoothscroll').on('click', function (e) {
        e.preventDefault();
        var target = this.hash;

        $('html, body').stop().animate({
            'scrollTop': $(target).offset().top - 80
        }, 1200);
    });


    /*---------------------
    countdown
    --------------------- */
    $('[data-countdown]').each(function () {
        var $this = $(this),
            finalDate = $(this).data('countdown');
        $this.countdown(finalDate, function (event) {
            $this.html(event.strftime('<span class="cdown days"><span class="time-count">%-D</span> <p>Days</p></span> <span class="cdown hour"><span class="time-count">%-H</span> <p>Hour</p></span> <span class="cdown minutes"><span class="time-count">%M</span> <p>Min</p></span> <span class="cdown second"> <span><span class="time-count">%S</span> <p>Sec</p></span>'));
        });
    });

    /*---------------------
    about-video-popup
    --------------------- */
    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 300,
        preloader: false,
        fixedContentPos: false
    });


    /*---------------------
    fancybox
    --------------------- */
    $('[data-fancybox]').fancybox({
        image: {
            protect: true
        }
    });

    /*---------------------
    page-case-study
    --------------------- */
    $('#container').imagesLoaded(function () { //image loaded

        // filter items on button click
        $('.case-menu').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({
                filter: filterValue
            });
            $('.case-menu').find('.checked').removeClass('checked');
            $(this).addClass('checked');
        });

        // masonary activation
        var $grid = $('.grid_container').isotope({
            itemSelector: '.grid',
            percentPosition: true,
            masonry: {
                // use outer width of grid-sizer for columnWidth
                columnWidth: '.grid'
            }
        })
    });


    /*---------------------
    gallery-study
    --------------------- */
    $('#container').imagesLoaded(function () { //image loaded

        // filter items on button click
        $('.gallery-menu').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({
                filter: filterValue
            });
            $('.gallery-menu').find('.checked').removeClass('checked');
            $(this).addClass('checked');
        });

        // masonary activation
        var $grid = $('.grid_container').isotope({
            itemSelector: '.grid',
            percentPosition: true,
            masonry: {
                // use outer width of grid-sizer for columnWidth
                columnWidth: '.grid'
            }
        })
    });


    /*---------------------
    home1-slider
    --------------------- */
    $('#js-main-slider').pogoSlider({
        autoplay: true,
        autoplayTimeout: 8000000,
        displayProgess: true,
        preserveTargetSize: true,
        targetWidth: 1000,
        targetHeight: 420,
        responsive: true
    }).data('plugin_pogoSlider');

    var transitionDemoOpts = {
        displayProgess: false,
        generateNav: false,
        generateButtons: false
    }

    $('#demo1').pogoSlider(transitionDemoOpts);
    $('#demo2').pogoSlider(transitionDemoOpts);
    $('#demo3').pogoSlider(transitionDemoOpts);
    $('#demo4').pogoSlider(transitionDemoOpts);
    $('#demo5').pogoSlider(transitionDemoOpts);
    $('#demo6').pogoSlider(transitionDemoOpts);
    $('#demo7').pogoSlider(transitionDemoOpts);
    $('#demo8').pogoSlider(transitionDemoOpts);
    $('#demo9').pogoSlider(transitionDemoOpts);
    $('#demo10').pogoSlider(transitionDemoOpts);
    $('#demo11').pogoSlider(transitionDemoOpts);
    $('#demo12').pogoSlider(transitionDemoOpts);


    /*---------------------
    case-study-carousel
    --------------------- */
    function case_study_carousel() {
        var owl = $(".case-study-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 1,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: true,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 1
                }
            }
        });
    }
    case_study_carousel();


    /*---------------------
    cservice-carousel
    --------------------- */
    function service_carousel() {
        var owl = $(".service-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 3,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        });
    }
    service_carousel();


    /*---------------------
    testimonial-carousel
    --------------------- */
    function testimonial_carousel() {
        var owl = $(".testimonial-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 2,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 1
                },
                992: {
                    items: 2
                }
            }
        });
    }
    testimonial_carousel();


    /*---------------------
    blog-carousel
    --------------------- */
    function blog_carousel() {
        var owl = $(".blog-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 3,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        });
    }
    blog_carousel();


    /*---------------------
    bdcs-carousel
    --------------------- */
    function bdcs_carousel() {
        var owl = $(".bdcs-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 3,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        });
    }
    bdcs_carousel();


    /*---------------------
    pdl-rp-carousel
    --------------------- */
    function pdl_rp_carousel() {
        var owl = $(".pdl-rp-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 3,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        });
    }
    pdl_rp_carousel();


    /*---------------------
    bimg-carousel
    --------------------- */
    function bimg_carousel() {
        var owl = $(".bimg-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 1,
            smartSpeed: 2000,
            dots: true,
            autoplay: false,
            autoplayTimeout: 4000,
            center: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 1
                },
                992: {
                    items: 1
                }
            }
        });
    }
    bimg_carousel();


    /*---------------------
    h4-slider-carousel
    --------------------- */
    function h4_slider_carousel() {
        var owl = $(".h4-slider-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 0,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 1,
            smartSpeed: 500,
            dots: true,
            autoplay: true,
            autoplayTimeout: 6000,
            center: false,
            animateIn: 'fadeIn',
            animateOut: 'fadeOut',
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 1
                },
                760: {
                    items: 1
                },
                992: {
                    items: 1
                }
            }
        });
    }
    h4_slider_carousel();


    /*---------------------
    brand-carousel
    --------------------- */
    function brand_carousel() {
        var owl = $(".brand-carousel");
        owl.owlCarousel({
            loop: true,
            margin: 20,
            responsiveClass: true,
            navigation: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            nav: false,
            items: 6,
            smartSpeed: 400,
            dots: false,
            autoplay: true,
            autoplayTimeout: 4000,
            center: false,
            animateIn: 'fadeIn',
            animateOut: 'fadeOut',
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 3
                },
                760: {
                    items: 5
                },
                992: {
                    items: 6
                }
            }
        });
    }
    brand_carousel();


    /*---------------------
    // Ajax Contact Form
    --------------------- */

    $('.cf-msg').hide();
    $('form#cf button#submit').on('click', function () {
        var fname = $('#fname').val();
        var email = $('#email').val();
        var msg = $('#msg').val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if (!regex.test(email)) {
            alert('Please enter valid email');
            return false;
        }

        fname = $.trim(fname);
        email = $.trim(email);
        msg = $.trim(msg);

        if (fname != '' && email != '' && msg != '') {
            var values = "fname=" + fname + "&email=" + email + " &msg=" + msg;
            $.ajax({
                type: "POST",
                url: "mail.php",
                data: values,
                success: function () {
                    $('#fname').val('');
                    $('#email').val('');
                    $('#msg').val('');

                    $('.cf-msg').fadeIn().html('<div class="alert alert-success"><strong>Success!</strong> Email has been sent successfully.</div>');
                    setTimeout(function () {
                        $('.cf-msg').fadeOut('slow');
                    }, 4000);
                }
            });
        } else {
            $('.cf-msg').fadeIn().html('<div class="alert alert-danger"><strong>Warning!</strong> Please fillup the informations correctly.</div>')
        }
        return false;
    });


    /*---------------------
    parallax
    --------------------- */
    // $('.h5-slider-area').parallax("20%", .1);



}(jQuery));