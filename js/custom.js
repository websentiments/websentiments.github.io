
var winW,
	winH,
	winS = $(window).scrollTop(),
	isMobile = false,
	isTablet = false,
	tabletThr = 1024,				// tablet threshold
	mobileThr = 720,				// mobile threshold
	header,							// header
	hH = 56,						// header height
	pR = 4;							// paralax ratio

$.ajaxSetup({ cache: false }); // Prevents caching

// jQ Easing extension

jQuery.easing.swing = jQuery.easing.swing;
jQuery.extend( jQuery.easing, {
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t===0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t===0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	}
});

function initOnLoad() {

	adjustContent();
	slideSwitcher( $("#testimonials") );
	formActionHandler( $("#contact-form"), "php/sendmail.php" );
	if ( !isMobile ) { buildBGParalax( $(".bg-paralax-fx") ); }
	buildNavigation( $("#header-nav") );

}

function goGA( event, category, label ) {

	// Checking if Analytics is enabled
	if ( typeof(ga) == "function" ) { ga('send', 'event', category, event, label); }
	else { console.log( "goGA: Google Analytics was not initialized properly." ); }

}

function initOnReady() {

	header = $("#main-header");
    adjustHeader();
}

function adjustHeader(){
    winS = $(window).scrollTop();

    if ( winS >= 100 ) { header.addClass("compact"); }
    else { header.removeClass("compact"); }
}

$(document).on({
	ready: function(){
		initOnReady();
	}
});

$(window).on({

	load: function(){
		initOnLoad();
	},

	scroll: adjustHeader,

	resize: function(){
		getWindowDimensions();
		adjustContent();
	}

});

function getWindowDimensions(){

	winH = $(window).height();
	winW = $(window).width();

	if ( winW < tabletThr ) { isTablet = true; } else { isTablet = false; }
	if ( winW < mobileThr ) { isMobile = true; } else { isMobile = false; }

}

function adjustContent(){

	// 0. Getting window dimensions

	getWindowDimensions();

	// 2. Adjusting testimonials slideshow

	var liMH = 0,
		ulH = 0;

	$("#testimonials-container")
		.find("li")
		.each(
			function(){
				var liH = $(this).height();
				if ( liH > liMH ){
					liMH = liH;
					ulH = liMH;
					$("#testimonials-container").height( ulH );
				}
		})
		.each(
			function(){
				var liH = $(this).height();

				if ( liH < ulH ) {
					$(this).css({
						top: (ulH-liH)/2
					});
				}
		});

}

function slideSwitcher( slideShow ) {

	var slides = slideShow.find(".slides"),
		slideNav = slideShow.find(".slide-nav"),
		slideNavItems = slideShow.find(".slide-nav li");

	slideNavItems
		.on({
			click: function(){
				var slideInd = $(this).index();
				slideNavItems.removeClass("current");
				$(this).addClass("current");

				slides
					.find("li")
					.removeClass("current")
					.eq(slideInd)
					.addClass("current");

				return false;
			}
		});

}

function formActionHandler( form, actionURL ){

	form.on({
		submit: function(){

			$(this).removeClass("sent");

			var reqEmpty = $(this).find(".required").filter( function(){ return $(this).val() == ""; }),
				data = "";

			$(this).find(".invalid").removeClass("invalid");

			if ( reqEmpty.length !== 0 ) {
				reqEmpty
					.first()
					.addClass("invalid")
					.focus();
			} else {

				data = $(this).serialize();

				$.ajax({
					type: "POST",
					url: actionURL,
					data: data,
					beforeSend: function(){ form.addClass("standby"); },
					success: function( data ) {
						form.addClass("sent");
						setTimeout(function(){ resetForm( form ); }, 2000 );
					}
				});
			}

			return false;
		}
	});

	function resetForm( form ) {
		form.find("input, textarea").val("");
	}

}

function getBGImgSizes( objs ) {

	var outputArr = [];

	objs.each(
		function(){
			var objBGI = $(this).css("background-image").replace(/url\(|\)|\"/gm, "");
				img = new Image(),
				objBGS = parseInt($(this).css("background-size"),10);

			img.src = objBGI;

			$(img).on({ load: function(){

					var bgW = img.width,
						bgH = img.height,
						bgR = bgW/bgH;

					if ( objBGS ) {
						bgW = objBGS;
						bgH = bgW/bgR;
					}

					outputArr.push( bgW + "x" + bgH );

				}
			});

		}
	);

	return outputArr;

}

function buildBGParalax ( objs ) {

	var objsArr = getBGImgSizes( objs );

	objs.each(function(){

		var obj = $(this);

		$(window).on({
			scroll: function(){
				var oT = obj.offset().top,
					oH = obj.height(),
					oBP = obj.css("background-position"),
					oIS = objsArr[obj.index()-1];

					oBP = oBP.split(" ");
					oIS = oIS.split(/x/);

				var oIH = oIS[1],
					oBPx = oBP[0];

				if ( winS >= oT && winS < oT+oH) {
					obj.css({
						backgroundPosition: oBPx + " " + ((oH-oIH)+winS/pR) +"px"
					});
				}

			},
			resize: function(){

				// window resize fix
				objs.attr("style", "");

			}
		});

	});

}

function buildNavigation ( nav ) {

	var items = nav.find("li a:not([class='external'])");

	items.on({
		click: function(){

			if ( !$(this).parent().hasClass("current")  ) {

				nav.find("li").removeClass("current");
				$(this).parent().addClass("current");

				var ind = $(this).parent().index(),
					sec = $("section").eq(ind),
					sT = sec.offset().top,
					dH = $(document).height();
					delta = sT-hH;

				if ( delta < 0 ) { delta = 0;}
				if ( delta > dH-winH ) { delta = dH-winH;}

				$("body, html").stop().animate({
					scrollTop: delta
				},2000, "easeInOutExpo");

			}

			return false;

		}
	});

	nav.find(".logo a")
		.on({
			click: function(){
				$("body, html").stop().animate({
					scrollTop: 0
				},2000, "easeInOutExpo");
				return false;
			}
		});

	$("#nav-trigger").on({
		click: function(){
			$("body").toggleClass("show-nav");
			return false;
		}
	});

	if ( isMobile || isTablet ) {
		$("#wrapper").swipe({
			threshold: 75,
			allowPageScroll: "vertical",
			swipeLeft: function() {
				if ( !$("body").hasClass("show-nav") ){ $("body").addClass("show-nav"); }
			},
			swipeRight: function() {
				if ( $("body").hasClass("show-nav") ){ $("body").removeClass("show-nav"); }
			},
			tap: function(){
				if ( $("body").hasClass("show-nav") ){ $("body").removeClass("show-nav"); }
			}

		});
	}

	scrollSwitcher( $("section"), nav );

}

function scrollSwitcher( container, nav ) {

	container
		.each(function(){
			var obj = $(this),
				off = obj.offset(),
				top = off.top-hH,
				h = obj.height(),
				ind = obj.index();

			$(window).on({
				scroll: function(){
					if ( winS > top-1 && winS <= top+h ) {
						console.log(ind-1);
						var curNav = nav.find("li").eq(ind);
						if ( !curNav.hasClass("current") ) {
							nav.find("li").removeClass("current");
							nav.find("li").eq(ind-1).addClass("current");
						}
					} else if ( winS === 0 ) {
						nav.find("li").removeClass("current");
						nav.find("li:first").addClass("current");
					}
				}
			});
		})

}
