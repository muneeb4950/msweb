/* First-visit lead popup. Self-contained: injects its own CSS/DOM, ensures the Meta Pixel is loaded,
   fires Lead events, and sends the enquiry to WhatsApp (the site has no backend). */
(function(){
  "use strict";
  var PIXEL_ID="1570756977857150", WA="923061982828", KEY="ms_lead_popup_v1", DELAY=6000;

  function store(get,v){try{if(get)return localStorage.getItem(KEY);localStorage.setItem(KEY,v);}catch(e){return null;}}

  // Make sure the pixel exists on every page (homepage already has it).
  if(!window.fbq){
    (function(f,b,e,v,n){n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      var t=b.createElement(e);t.async=!0;t.src=v;b.head.appendChild(t);})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init',PIXEL_ID);fbq('track','PageView');
  }
  function track(){try{window.fbq&&fbq.apply(null,arguments);}catch(e){}}

  if(location.pathname!=='/'&&!/^\/index\.html$/.test(location.pathname))return; // home page only
  if(store(true))return; // already seen / submitted: never show again

  var css='#mslp{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(7,27,43,.72);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}'
  +'#mslp.on{display:flex}'
  +'#mslp .b{position:relative;width:100%;max-width:420px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:16px;padding:26px 22px 20px;color:#071b2b;box-shadow:0 20px 60px rgba(0,0,0,.4)}'
  +'#mslp h2{margin:0 0 4px;font-size:21px;line-height:1.25;color:#071b2b;text-align:center}'
  +'#mslp .s{margin:0 0 16px;font-size:13.5px;color:#5B6573;text-align:center}'
  +'#mslp label{display:block;margin:0 0 5px;font-size:13px;font-weight:600;color:#071b2b}'
  +'#mslp .f{margin-bottom:12px}'
  +'#mslp input,#mslp select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d8dde4;border-radius:10px;font-size:16px;background:#f8fafc;color:#071b2b}'
  +'#mslp input:focus,#mslp select:focus{outline:2px solid #167d8d;border-color:#167d8d}'
  +'#mslp .x{position:absolute;top:8px;right:10px;width:34px;height:34px;border:0;background:none;font-size:26px;line-height:1;color:#5B6573;cursor:pointer}'
  +'#mslp .go{width:100%;margin-top:4px;padding:13px;border:0;border-radius:10px;background:#1FA855;color:#fff;font-size:16px;font-weight:700;cursor:pointer}'
  +'#mslp .go:hover{background:#178a45}'
  +'#mslp .e{display:none;margin:-6px 0 10px;font-size:12.5px;color:#c0392b}'
  +'#mslp .e.on{display:block}'
  +'#mslp .n{margin:12px 0 0;text-align:center;font-size:12px;color:#5B6573}';
  var st=document.createElement('style');st.textContent=css;

  var html='<div class="b" role="dialog" aria-modal="true" aria-labelledby="mslp-t">'
  +'<button type="button" class="x" aria-label="Close">&times;</button>'
  +'<h2 id="mslp-t">Get a Free Site Visit &amp; Quote</h2>'
  +'<p class="s">Tell us about your plot and our team will contact you.</p>'
  +'<form novalidate>'
  +'<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">'
  +'<div class="f"><label for="mslp-n">Name</label><input id="mslp-n" type="text" autocomplete="name" placeholder="Your full name" required></div>'
  +'<div class="f"><label for="mslp-p">Phone Number</label><input id="mslp-p" type="tel" inputmode="numeric" autocomplete="tel" maxlength="13" placeholder="03XXXXXXXXX" required></div>'
  +'<p class="e" id="mslp-pe">Enter a valid phone number (digits only, 10 to 13).</p>'
  +'<div class="f"><label for="mslp-z">Plot Size</label><select id="mslp-z" required><option value="">Select plot size</option>'
  +'<option value="5 Marla">5 Marla</option><option value="10 Marla">10 Marla</option><option value="1 Kanal">1 Kanal</option><option value="2 Kanal">2 Kanal</option><option value="4 Kanal">4 Kanal</option></select></div>'
  +'<div class="f"><label for="mslp-s">Society Name</label><input id="mslp-s" type="text" placeholder="e.g. Bahria Town, DHA, Lake City" required></div>'
  +'<div class="f"><label for="mslp-m">Is Map Ready?</label><select id="mslp-m" required><option value="">Select</option><option>Yes</option><option>No</option></select></div>'
  +'<button type="submit" class="go">Submit &amp; Chat on WhatsApp</button>'
  +'</form><p class="n">We never share your details.</p></div>';

  var root,form,shown=false;

  function build(){
    root=document.createElement('div');root.id='mslp';root.innerHTML=html;
    document.head.appendChild(st);document.body.appendChild(root);
    form=root.querySelector('form');
    root.querySelector('.x').addEventListener('click',function(){close(true);});
    root.addEventListener('click',function(e){if(e.target===root)close(true);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('on'))close(true);});
    var ph=form.querySelector('#mslp-p');
    ph.addEventListener('input',function(){ph.value=ph.value.replace(/[^0-9]/g,'');});
    form.addEventListener('submit',submit);
  }

  function open(){
    if(shown||store(true))return;shown=true;
    store(false,'shown'); // mark as seen immediately so it never reappears, even if they leave without closing it
    build();root.classList.add('on');
    document.body.style.overflow='hidden';
    track('trackCustom','LeadPopupView');
    setTimeout(function(){var n=root.querySelector('#mslp-n');n&&n.focus();},50);
  }
  function close(dismissed){
    root.classList.remove('on');document.body.style.overflow='';
    store(false,dismissed?'dismissed':'submitted');
    if(dismissed)track('trackCustom','LeadPopupDismiss');
  }

  function submit(e){
    e.preventDefault();
    var g=function(id){return form.querySelector('#mslp-'+id).value.trim();};
    var name=g('n'),phone=g('p'),size=g('z'),soc=g('s'),map=g('m');
    var pe=form.querySelector('#mslp-pe');
    var okPhone=/^\d{10,13}$/.test(phone);
    pe.classList.toggle('on',!okPhone);
    if(!okPhone){form.querySelector('#mslp-p').focus();return;}
    if(!name||!size||!soc||!map){form.reportValidity&&form.reportValidity();return;}

    // Only non-personal fields go to Meta (no name / phone) to keep the pixel privacy-safe.
    track('track','Lead',{content_name:'Site Visit Popup',plot_size:size,society:soc,map_ready:map});
    // Email the lead to the business inbox (also sent to WhatsApp below).
    try{
      var fd=new URLSearchParams({name:name,phone:phone,size:size,society:soc,map:map,website:form.querySelector('[name=website]').value,page:location.href});
      fetch('/api/lead.php',{method:'POST',body:fd,keepalive:true}).catch(function(){});
    }catch(err){}
    var msg="Hello, my name is "+name+".\nPhone: "+phone+"\nPlot Size: "+size+"\nSociety: "+soc+"\nMap Ready: "+map+"\nI'd like a free site visit and quote.";
    close(false);
    // Short delay lets the pixel request fire before the new tab opens.
    setTimeout(function(){window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener');},250);
  }

  function arm(){setTimeout(open,DELAY);}
  if(document.readyState==='complete')arm();else addEventListener('load',arm);
})();
