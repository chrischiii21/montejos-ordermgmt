import{c as Pe}from"./index.Bfd5Thr0.js";const G=Pe("https://pmbbpxfchjxzatapzwyw.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYmJweGZjaGp4emF0YXB6d3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjczNTMsImV4cCI6MjA5NjQ0MzM1M30.vf-MGuB8gIa34H4DjUaoN-057D7lnQL3YCJd3ouVVng"),Be={"Set A Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","100 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken"],"Set B Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","150 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken","1 tray Calamares"],"Set C Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","200 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken","1 tray Calamares","1 tray Chicken Guisado"],"P1 Package (Bilao)":["1 whole Lechon Manok","30 pieces Pork Lumpia","10 pieces Battered Chicken","1/2 kilo Buttered Shrimps","25 pieces Calamares","Half tray Special Bam-i","1 tray Chosen Dessert"],"P2 Package (Bilao)":["3 kilos Lechon Belly","30 pieces Pork Lumpia","10 pieces Battered Chicken","1/2 kilo Buttered Shrimps","25 pieces Calamares","Half tray Special Bam-i","1 tray Chosen Dessert"],"P3 Package (Bilao)":["4 kilos Lechon Belly","40 pieces Pork Lumpia","15 pieces Battered Chicken","10 pieces Buffalo / Teriyaki Chicken","3/4 kilo Buttered Shrimps","40 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P4 Package (Bilao)":["5 kilos Lechon Belly","50 pieces Pork Lumpia","20 pieces Battered Chicken","15 pieces Buffalo / Teriyaki Chicken","3/4 kilo Buttered Shrimps","50 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P5 Package (Bilao)":["6 kilos Lechon Belly","70 pieces Pork Lumpia","25 pieces Battered Chicken","20 pieces Buffalo / Teriyaki Chicken","1 kilo Buttered Shrimps","60 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P6 Package (Bilao)":["7 kilos Lechon Belly","80 pieces Pork Lumpia","30 pieces Battered Chicken","25 pieces Buffalo / Teriyaki Chicken","1 kilo Buttered Shrimps","70 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"]};function Ie(t){for(const e in Be)if(t.toLowerCase().includes(e.toLowerCase())||e.startsWith("P")&&t.toLowerCase().includes(e.toLowerCase().split(" ")[0]+" package"))return[...Be[e]];return null}let v=[],ge="All",ye="",q=[],te="Owner",Q="Pickup";function Me(t){return{id:t.id,date:t.date,customer:t.customer,address:t.address,contact:t.contact,deliveryDateTime:t.delivery_date_time??"",fulfillmentType:t.fulfillment_type??"Delivery",status:t.status,total:parseFloat(t.total),downpayment:parseFloat(t.downpayment),balance:parseFloat(t.balance),deliveryFee:parseFloat(t.delivery_fee??0),items:(t.order_items??[]).map(e=>({name:e.name,quantity:e.quantity,price:parseFloat(e.price),total:parseFloat(e.total),customInclusions:e.custom_inclusions??[]}))}}async function Ae(){const{data:t,error:e}=await G.from("orders").select("*, order_items(*)").order("created_at",{ascending:!1});if(e){console.error("Error loading orders:",e.message);return}v=(t??[]).map(Me)}document.addEventListener("DOMContentLoaded",async()=>{qe(),await Ae(),_(),je(),Je(),Ze();const t=document.getElementById("mobile-menu-btn"),e=document.querySelector(".sidebar"),n=document.getElementById("sidebar-overlay");t&&e&&n&&(t.addEventListener("click",()=>{e.classList.add("active"),n.classList.add("active")}),n.addEventListener("click",()=>{e.classList.remove("active"),n.classList.remove("active")}),e.querySelectorAll(".nav-item").forEach(a=>{a.addEventListener("click",()=>{e.classList.remove("active"),n.classList.remove("active")})}))});function qe(){const t=document.getElementById("current-date");if(t){const e={weekday:"long",year:"numeric",month:"long",day:"numeric"};t.textContent=new Date().toLocaleDateString("en-US",e)}}function _(){ze(),Oe(),fe(),Ne()}function ze(){const t=v.filter(r=>r.status!=="Cancelled"),e=t.filter(r=>r.status==="Completed"||r.status==="Preparing").reduce((r,l)=>r+l.total,0),n=v.filter(r=>r.status==="Pending"||r.status==="Preparing").length,a=t.reduce((r,l)=>r+l.items.reduce((c,o)=>c+o.quantity,0),0),s=t.filter(r=>r.status==="Completed"||r.status==="Preparing").length,i=s>0?e/s:0;X("revenue-val",`₱${e.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`),X("active-orders-val",n.toString()),X("avg-order-val",`₱${i.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`),X("items-sold-val",a.toString()),Z("revenue-trend",e>5e3?"+14.2%":"+0%",e>5e3),Z("active-trend",n>2?"+25%":"+0%",n>2),Z("avg-trend",i>300?"+4.8%":"+0%",i>300),Z("items-trend",a>5?"+18%":"+0%",a>5)}function X(t,e){const n=document.getElementById(t);n&&(n.textContent=e)}function Z(t,e,n){const a=document.getElementById(t);if(a){const s=a.querySelector(".trend-text");s&&(s.textContent=e),a.className=`trend-badge ${n?"trend-up":"trend-down"}`;const i=a.querySelector(".trend-icon");i&&(i.innerHTML=n?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 5v14"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>')}}function Oe(){const t=document.getElementById("best-sellers-list");if(!t)return;const e=v.filter(r=>r.status!=="Cancelled"),n={};e.forEach(r=>{r.items.forEach(l=>{const c=l.name;n[c]||(n[c]={quantity:0,revenue:0}),n[c].quantity+=l.quantity,n[c].revenue+=l.total})});const a=Object.keys(n).map(r=>({name:r,quantity:n[r].quantity,revenue:n[r].revenue}));if(a.sort((r,l)=>l.quantity-r.quantity),a.length===0){t.innerHTML=`
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
					<p>No orders recorded yet to calculate sales.</p>
				</div>
			`;return}const s=a[0].quantity,i=a.slice(0,4);t.innerHTML=i.map((r,l)=>{const c=l+1,o=c<=3?`rank-${c}`:"rank-other",m=s>0?r.quantity/s*100:0;return`
				<div class="seller-item">
					<div class="rank-badge ${o}">#${c}</div>
					<div class="seller-info">
						<div class="seller-meta">
							<span class="seller-name">${r.name}</span>
							<div class="seller-stats">
								<span class="sales-count">${r.quantity} sold</span>
								<span class="sales-revenue">₱${r.revenue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
							</div>
						</div>
						<div class="progress-track">
							<div class="progress-fill" style="width: ${m}%"></div>
						</div>
					</div>
				</div>
			`}).join("")}function fe(){const t=document.getElementById("order-table-body"),e=document.getElementById("table-empty-state");if(!t||!e)return;let n=v;if(ge!=="All"&&(n=n.filter(s=>s.status===ge)),ye.trim()!==""){const s=ye.toLowerCase().trim();n=n.filter(i=>i.id.toLowerCase().includes(s)||i.customer.toLowerCase().includes(s)||i.items.some(r=>r.name.toLowerCase().includes(s)))}const a=new Date;if(n.sort((s,i)=>{const r=s.deliveryDateTime||s.date,l=i.deliveryDateTime||i.date,c=new Date(r.replace(" ","T")),o=new Date(l.replace(" ","T")),m=isNaN(c.getTime())?1/0:c.getTime(),d=isNaN(o.getTime())?1/0:o.getTime(),h=Math.abs(m-a.getTime()),u=Math.abs(d-a.getTime());return h-u}),n.length===0){t.innerHTML="",e.style.display="flex";return}else e.style.display="none";t.innerHTML=n.map(s=>{const i=`badge-${s.status.toLowerCase()}`;return`
				<tr data-order-id="${s.id}">
					<td>
						<button class="action-btn btn-view-details" data-id="${s.id}" title="View Details">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
						</button>
					</td>
					<td class="order-id-cell">#${s.id.replace("ORD-","")}</td>
					<td class="customer-cell">${s.customer}</td>
					<td class="date-cell">${s.deliveryDateTime||'<span class="text-muted">Pending Customer Input</span>'}</td>
					<td><span class="status-badge ${i}">${s.status}</span></td>
				</tr>
			`}).join(""),He()}function Ne(){const t=document.getElementById("count-all"),e=document.getElementById("count-pending"),n=document.getElementById("count-preparing"),a=document.getElementById("count-completed"),s=document.getElementById("count-cancelled");t&&(t.textContent=v.length.toString()),e&&(e.textContent=v.filter(i=>i.status==="Pending").length.toString()),n&&(n.textContent=v.filter(i=>i.status==="Preparing").length.toString()),a&&(a.textContent=v.filter(i=>i.status==="Completed").length.toString()),s&&(s.textContent=v.filter(i=>i.status==="Cancelled").length.toString())}function je(){const t=document.getElementById("open-order-modal-btn"),e=document.getElementById("close-order-modal-btn"),n=document.getElementById("cancel-order-btn"),a=document.getElementById("order-modal-overlay"),s=()=>a?.classList.add("active"),i=()=>{a?.classList.remove("active"),De()};t?.addEventListener("click",s),e?.addEventListener("click",i),n?.addEventListener("click",i),a?.addEventListener("click",y=>{y.target===a&&i()}),document.getElementById("order-search")?.addEventListener("input",y=>{ye=y.target.value,fe()});const c=document.getElementById("order-status-tabs")?.querySelectorAll(".filter-tab");c?.forEach(y=>{y.addEventListener("click",()=>{c.forEach(b=>b.classList.remove("active")),y.classList.add("active"),ge=y.getAttribute("data-status")||"All",fe()})});const o=document.getElementById("link-modal-overlay"),m=document.getElementById("close-link-modal-btn"),d=document.getElementById("close-link-modal-action-btn"),h=()=>{o?.classList.remove("active")};m?.addEventListener("click",h),d?.addEventListener("click",h),o?.addEventListener("click",y=>{y.target===o&&h()});const u=document.getElementById("details-modal-overlay"),p=document.getElementById("close-details-modal-btn"),f=()=>{u?.classList.remove("active")};p?.addEventListener("click",f),u?.addEventListener("click",y=>{y.target===u&&f()});const x=document.getElementById("copy-shareable-link-btn"),B=document.getElementById("shareable-link-input");x?.addEventListener("click",()=>{B&&B.value&&navigator.clipboard.writeText(B.value).then(()=>{$("Shareable link copied to clipboard!");const y=x.textContent;x.textContent="Copied!",setTimeout(()=>{x.textContent=y},2e3)})})}function He(){document.querySelectorAll(".btn-view-details").forEach(t=>{t.addEventListener("click",e=>{const n=e.currentTarget.getAttribute("data-id");n&&U(n)})})}function U(t){const e=v.find(l=>l.id===t);if(!e)return;const n=document.getElementById("details-title");n&&(n.textContent=`Order #${t.replace("ORD-","")}`);const a=e.items.map(l=>{const c=l.customInclusions&&l.customInclusions.length>0?`
				<div class="detail-item-customizations" style="grid-column: 1 / -1; margin-top: 4px; padding-left: 12px; font-size: 0.75rem; color: var(--accent-primary); border-left: 2px solid var(--accent-primary);">
					<div style="font-weight: 700; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 2px;">Custom Inclusions:</div>
					<ul style="margin: 0; padding-left: 12px; list-style-type: disc; color: var(--text-secondary);">
						${l.customInclusions.map(o=>`<li>${o}</li>`).join("")}
					</ul>
				</div>
			`:"";return`
				<div class="detail-item-row" style="display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.875rem;">
					<span class="detail-item-qty" style="color: var(--accent-primary); font-weight: 700;">${l.quantity}x</span>
					<span class="detail-item-name" style="color: var(--text-primary); font-weight: 500;">${l.name}</span>
					<span class="detail-item-price" style="color: var(--text-secondary);">₱${l.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					<span class="detail-item-total" style="color: var(--text-primary); font-weight: 600;">₱${l.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					${c}
				</div>
			`}).join(""),s=Ue(e),i=document.getElementById("details-modal-body");i&&(i.innerHTML=`
				<div class="detail-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; text-align: left;">
					<!-- Left Column: Items Breakdown & Payments -->
					<div class="detail-left-column" style="display: flex; flex-direction: column; gap: 20px;">
						<!-- Items breakdown card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 12px; letter-spacing: 0.05em;">Items Breakdown</div>
							<div class="detail-items-list" style="max-height: 200px; overflow-y: auto; padding-right: 4px;">
								${a}
							</div>
						</div>
						
						<!-- Payment breakdown card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 12px; letter-spacing: 0.05em;">Payment Breakdown</div>
							<div class="detail-fields" style="display: flex; flex-direction: column; gap: 8px;">
								<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
									<span class="field-label" style="color: var(--text-secondary);">Subtotal:</span>
									<span class="field-value" style="color: var(--text-primary);">₱${(e.total-(e.deliveryFee||0)).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
								</div>
								<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
									<span class="field-label" style="color: var(--text-secondary);">Delivery/Meetup Fee:</span>
									<span class="field-value" style="color: var(--text-primary);">₱${(e.deliveryFee||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
								</div>
								<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 6px; margin-top: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-weight: 700;">Total Bill:</span>
									<span class="field-value highlight-total" style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
								</div>
								<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
									<span class="field-label" style="color: var(--text-secondary);">Downpayment Paid:</span>
									<span class="field-value highlight-downpayment" style="font-weight: 700; color: var(--status-preparing);">₱${e.downpayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
								</div>
								<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
									<span class="field-label" style="color: var(--text-secondary);">Remaining Balance:</span>
									<span class="field-value highlight-balance" style="font-weight: 700; color: var(--accent-primary);">₱${e.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Right Column: Delivery Info & Status -->
					<div class="detail-right-column" style="display: flex; flex-direction: column; gap: 20px;">
						<!-- Customer & Delivery details card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 12px; letter-spacing: 0.05em;">Delivery & Contact Details</div>
							<div class="detail-fields" style="display: flex; flex-direction: column; gap: 10px; font-size: 0.875rem;">
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Customer Name:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.customer}</span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Fulfillment Type:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em;">${e.fulfillmentType||"Delivery"}</span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Order Status:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500;"><span class="status-badge badge-${e.status.toLowerCase()}">${e.status}</span></span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Order Created:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.date}</span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Exact Address:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500; line-height: 1.4;">${e.address||"N/A"}</span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Contact Number:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.contact||"N/A"}</span>
								</div>
								<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
									<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Delivery Date & Time:</span>
									<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.deliveryDateTime||"N/A"}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Action Buttons in details -->
				<div class="detail-actions-panel" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 12px;">
					<span class="actions-panel-title" style="font-size: 0.725rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Manage Order</span>
					<div class="detail-actions-buttons" style="display: flex; flex-wrap: wrap; gap: 10px;">
						${s}
					</div>
				</div>
			`,Re()),document.getElementById("details-modal-overlay")?.classList.add("active")}function Re(){const t=document.getElementById("details-modal-body");t&&(t.querySelectorAll(".btn-prepare").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&(V(a,"Preparing"),U(a))})}),t.querySelectorAll(".btn-complete").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&(V(a,"Completed"),U(a))})}),t.querySelectorAll(".btn-cancel").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&(V(a,"Cancelled"),U(a))})}),t.querySelectorAll(".btn-delete").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&confirm(`Are you sure you want to delete the record for Order #${a.replace("ORD-","")}?`)&&(Ve(a),document.getElementById("details-modal-overlay")?.classList.remove("active"))})}),t.querySelectorAll(".btn-copy-slip").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&_e(a,n.currentTarget)})}),t.querySelectorAll(".btn-get-link").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");if(a){const s=window.location.origin+"/order?id="+a;navigator.clipboard.writeText(s).then(()=>{const i=n.currentTarget;i.classList.add("copied");const r=i.innerHTML;i.innerHTML=`
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
							<span>Copied!</span>
						`,$("Customer share link copied to clipboard!"),setTimeout(()=>{i.classList.remove("copied"),i.innerHTML=r},2e3)}).catch(i=>{console.error("Could not copy link to clipboard: ",i)})}})}),t.querySelectorAll(".btn-download-receipt").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");a&&Ye(a)})}))}function Ue(t){let e="";return t.status==="Pending"?e+=`
				<button class="action-btn btn-prepare" data-id="${t.id}" title="Start Preparing">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/></svg>
					<span>Prepare Order</span>
				</button>
			`:t.status==="Preparing"&&(e+=`
				<button class="action-btn btn-complete" data-id="${t.id}" title="Complete Order">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
					<span>Complete Order</span>
				</button>
			`),(t.status==="Pending"||t.status==="Preparing")&&(e+=`
				<button class="action-btn btn-cancel" data-id="${t.id}" title="Cancel Order">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
					<span>Cancel</span>
				</button>
			`),e+=`
			<button class="action-btn btn-delete" data-id="${t.id}" title="Delete Record">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
				<span>Delete</span>
			</button>
		`,t.customer==="Pending Customer Details"&&(e=`
				<button class="action-btn btn-get-link" data-id="${t.id}" title="Copy Customer Share Link">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
					<span>Copy Link</span>
				</button>
			`+e),e=`
			<button class="action-btn btn-copy-slip" data-id="${t.id}" title="Copy Confirmation Slip">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
				<span>Copy Slip</span>
			</button>
		`+e,e=`
			<button class="action-btn btn-download-receipt" data-id="${t.id}" title="Download Receipt" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #10b981;">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
				<span>Receipt</span>
			</button>
		`+e,e}async function V(t,e){const{error:n}=await G.from("orders").update({status:e}).eq("id",t);if(n){console.error("Failed to update status:",n.message),$("Failed to update order status.");return}const a=v.findIndex(s=>s.id===t);a>-1&&(v[a].status=e),_()}async function Ve(t){const{error:e}=await G.from("orders").delete().eq("id",t);if(e){console.error("Failed to delete order:",e.message),$("Failed to delete order.");return}v=v.filter(n=>n.id!==t),_()}function Ge(t){const e=document.getElementById("link-modal-overlay"),n=document.getElementById("shareable-link-input"),a=document.getElementById("open-shareable-link-btn"),s=window.location.origin+"/order?id="+t;n&&(n.value=s),a&&(a.href=s),e?.classList.add("active")}function _e(t,e){const n=v.find(l=>l.id===t);if(!n)return;const a=n.items.map(l=>{let c=`${l.quantity}x ${l.name}`;return l.customInclusions&&l.customInclusions.length>0&&(c+=`
  (Custom Inclusions:
`+l.customInclusions.map(o=>`   - ${o}`).join(`
`)+")"),c}).join(`
`),s=n.total-(n.deliveryFee||0),i=n.deliveryFee||0,r=`C O N F I R M A T I O N   S L I P
Please fill up the following.

Name: ${n.customer}
Fulfillment: ${n.fulfillmentType||"Delivery"}
Exact Address: ${n.address}
Contact Number of the Receiver/s: ${n.contact}
Time & Date: ${n.deliveryDateTime}
List of Order/s:
${a}

Subtotal: ₱${s.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
Delivery/Meetup Fee: ₱${i.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
TOTAL: ₱${n.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
DOWNPAYMENT: ₱${n.downpayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
BALANCE: ₱${n.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}

Note: To confirm your order, we are requesting 50% downpayment of the total bill, then the rest will be paid upon pickup/delivery of orders.

M O D E   O F   P A Y M E N T S

Maribank Details
Christy Montejo
11953471393

Gcash Details
Christy Montejo
09760721404`;navigator.clipboard.writeText(r).then(()=>{e.classList.add("copied");const l=e.innerHTML;e.innerHTML=`
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
				<span>Copied!</span>
			`,$("Confirmation slip copied to clipboard!"),setTimeout(()=>{e.classList.remove("copied"),e.innerHTML=l},2e3)}).catch(l=>{console.error("Could not copy confirmation slip to clipboard: ",l)})}function Ye(t){const e=v.find(o=>o.id===t);if(!e)return;const n=e.deliveryFee||0,a=e.total-n,s=window.open("","_blank");if(!s){$("Please allow popups to download/print receipts.");return}let i="UNPAID",r="status-unpaid",l="Please make a downpayment to confirm your order.";e.downpayment>=e.total?(i="PAID",r="status-paid",l="Order has been fully paid. Thank you!"):e.downpayment>0&&(i="PARTIALLY PAID",r="status-partial",l="Downpayment received. Remaining balance to be settled upon pickup/delivery.");const c=`
<!DOCTYPE html>
<html>
<head>
	<title>Receipt ${e.id}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<style>
		:root {
			--primary: #0f172a;
			--accent: #f97316;
			--text-main: #334155;
			--text-muted: #64748b;
			--border: #e2e8f0;
			--bg-light: #f8fafc;
		}
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}
		body {
			font-family: 'Plus Jakarta Sans', sans-serif;
			color: var(--text-main);
			background-color: #f1f5f9;
			padding: 40px 20px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.receipt-container {
			background: #ffffff;
			width: 100%;
			max-width: 800px;
			padding: 48px;
			border-radius: 16px;
			box-shadow: 0 10px 25px rgba(0,0,0,0.05);
			position: relative;
			border: 1px solid var(--border);
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			border-bottom: 2px solid var(--border);
			padding-bottom: 24px;
			margin-bottom: 32px;
		}
		.company-title {
			font-size: 24px;
			font-weight: 800;
			color: var(--primary);
			letter-spacing: -0.02em;
			text-transform: uppercase;
		}
		.company-sub {
			font-size: 13px;
			color: var(--text-muted);
			margin-top: 4px;
			font-weight: 500;
		}
		.receipt-meta {
			text-align: right;
		}
		.meta-label {
			font-size: 11px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
		}
		.meta-value {
			font-size: 15px;
			font-weight: 700;
			color: var(--primary);
			margin-bottom: 8px;
		}
		.meta-date {
			font-size: 12px;
			color: var(--text-muted);
		}
		.details-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 40px;
			margin-bottom: 32px;
		}
		.details-column h3 {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
			margin-bottom: 12px;
			border-bottom: 1px solid var(--border);
			padding-bottom: 6px;
		}
		.details-text {
			font-size: 14px;
			line-height: 1.6;
			color: var(--primary);
			font-weight: 500;
		}
		.items-table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 32px;
		}
		.items-table th {
			background: var(--bg-light);
			color: var(--text-muted);
			font-size: 11px;
			font-weight: 800;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			padding: 12px 16px;
			text-align: left;
			border-bottom: 2px solid var(--border);
		}
		.items-table td {
			padding: 14px 16px;
			border-bottom: 1px solid var(--border);
			font-size: 14px;
			color: var(--primary);
			font-weight: 500;
		}
		.items-table .text-right {
			text-align: right;
		}
		.summary-section {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			border-top: 2px solid var(--border);
			padding-top: 24px;
			margin-bottom: 40px;
		}
		.payment-summary {
			max-width: 400px;
		}
		.payment-summary h4 {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
			margin-bottom: 12px;
		}
		.payment-field {
			display: flex;
			gap: 12px;
			font-size: 14px;
			margin-bottom: 6px;
			font-weight: 600;
		}
		.payment-field-label {
			color: var(--text-muted);
			width: 120px;
		}
		.payment-status-badge {
			display: inline-block;
			font-weight: 800;
			font-size: 12px;
			letter-spacing: 0.05em;
			margin-top: 8px;
			text-transform: uppercase;
		}
		.status-paid { color: #10b981; }
		.status-partial { color: #f97316; }
		.status-unpaid { color: #ef4444; }
		.payment-note {
			font-size: 12px;
			color: var(--text-muted);
			margin-top: 8px;
			line-height: 1.4;
			font-style: italic;
		}
		.financials-summary {
			width: 280px;
		}
		.financial-row {
			display: flex;
			justify-content: space-between;
			font-size: 14px;
			margin-bottom: 8px;
			font-weight: 600;
		}
		.financial-row.grand-total {
			font-size: 18px;
			font-weight: 800;
			color: var(--primary);
			border-top: 1px solid var(--border);
			padding-top: 12px;
			margin-top: 8px;
		}
		.financial-row.grand-total .val {
			color: var(--accent);
		}
		.footer {
			border-top: 1px dashed var(--border);
			padding-top: 24px;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
		}
		.footer-left {
			font-size: 11px;
			color: var(--text-muted);
			line-height: 1.5;
		}
		.footer-right {
			text-align: right;
		}
		.auth-label {
			font-size: 10px;
			font-weight: 700;
			color: var(--text-muted);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.auth-name {
			font-size: 13px;
			font-weight: 800;
			color: var(--primary);
			margin-top: 4px;
		}
		.system-note {
			text-align: center;
			font-size: 11px;
			color: var(--text-muted);
			margin-top: 32px;
			border-top: 1px solid var(--border);
			padding-top: 16px;
		}
		@media print {
			body {
				background-color: #ffffff;
				padding: 0;
			}
			.receipt-container {
				border: none;
				box-shadow: none;
				padding: 0;
				max-width: 100%;
			}
			* {
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
		}
	</style>
</head>
<body>
	<div class="receipt-container">
		<div class="header">
			<div>
				<h1 class="company-title">Montejo's Lechon & Food Trays</h1>
				<p class="company-sub">Argao, Cebu • Cel. No. 09763146889 / 09760721404</p>
			</div>
			<div class="receipt-meta">
				<div class="meta-label">Receipt No.</div>
				<div class="meta-value">${e.id.replace("ORD-","20260608-")}</div>
				<div class="meta-label">Issued</div>
				<div class="meta-date">${e.date}</div>
			</div>
		</div>

		<div class="details-row">
			<div class="details-column">
				<h3>Billed To</h3>
				<div class="details-text">
					<p>${e.customer}</p>
					<p>${e.address||"N/A"}</p>
					<p>${e.contact||"N/A"}</p>
				</div>
			</div>
			<div class="details-column">
				<h3>Order Details</h3>
				<div class="details-text">
					<p><strong>Fulfillment:</strong> ${e.fulfillmentType||"Delivery"}</p>
					<p><strong>Delivery Date:</strong> ${e.deliveryDateTime||"N/A"}</p>
					<p><strong>Status:</strong> ${e.status}</p>
				</div>
			</div>
		</div>

		<table class="items-table">
			<thead>
				<tr>
					<th>Item Description</th>
					<th class="text-right" style="width: 80px;">Qty</th>
					<th class="text-right" style="width: 120px;">Price</th>
					<th class="text-right" style="width: 150px;">Total</th>
				</tr>
			</thead>
			<tbody>
				${e.items.map(o=>{const m=o.customInclusions&&o.customInclusions.length>0?`
						<div style="margin-top: 4px; font-size: 11px; color: var(--text-muted); font-style: italic; line-height: 1.4;">
							<strong>Custom Inclusions:</strong> ${o.customInclusions.join(", ")}
						</div>
					`:"";return`
						<tr>
							<td>
								<div style="font-weight: 600;">${o.name}</div>
								${m}
							</td>
							<td class="text-right">${o.quantity}</td>
							<td class="text-right">₱${o.price.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
							<td class="text-right">₱${o.total.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
						</tr>
					`}).join("")}
			</tbody>
		</table>

		<div class="summary-section">
			<div class="payment-summary">
				<h4>Payment Summary</h4>
				<div class="payment-field">
					<span class="payment-field-label">Downpayment:</span>
					<span>₱${e.downpayment.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="payment-field">
					<span class="payment-field-label">Balance:</span>
					<span style="color: ${e.balance>0?"#f97316":"inherit"}">₱${e.balance.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="payment-status-badge ${r}">
					${i}
				</div>
				<p class="payment-note">${l}</p>
			</div>

			<div class="financials-summary">
				<div class="financial-row">
					<span class="label">Subtotal:</span>
					<span class="val">₱${a.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="financial-row">
					<span class="label">Delivery/Meetup Fee:</span>
					<span class="val">₱${n.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="financial-row grand-total">
					<span class="label">Total Amount:</span>
					<span class="val">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
			</div>
		</div>

		<div class="footer">
			<div class="footer-left">
				<p>For inquiries, please contact the numbers above.</p>
				<p>Thank you for choosing Montejo's!</p>
			</div>
			<div class="footer-right">
				<div class="auth-label">Authorized by</div>
				<div class="auth-name">MONTEJO'S LECHON & FOOD TRAYS</div>
			</div>
		</div>

		<div class="system-note">
			This is a system-generated e-receipt. No physical signature is required.
		</div>
	</div>
	<script>
		window.onload = function() {
			setTimeout(() => {
				window.print();
			}, 300);
		}
	<\/script>
</body>
</html>
		`;s.document.open(),s.document.write(c),s.document.close()}function $(t){let e=document.getElementById("toast-container");e||(e=document.createElement("div"),e.id="toast-container",e.style.position="fixed",e.style.bottom="24px",e.style.right="24px",e.style.zIndex="9999",e.style.display="flex",e.style.flexDirection="column",e.style.gap="8px",document.body.appendChild(e));const n=document.createElement("div");n.className="glass-panel",n.style.background="rgba(16, 185, 129, 0.15)",n.style.border="1px solid rgba(16, 185, 129, 0.4)",n.style.color="#10b981",n.style.padding="12px 20px",n.style.borderRadius="10px",n.style.fontSize="0.875rem",n.style.fontWeight="600",n.style.boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.3)",n.style.backdropFilter="blur(10px)",n.style.webkitBackdropFilter="blur(10px)",n.style.transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",n.style.opacity="0",n.style.transform="translateY(20px)",n.textContent=t,e.appendChild(n),n.offsetHeight,n.style.opacity="1",n.style.transform="translateY(0)",setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-20px)",setTimeout(()=>{n.remove()},300)},3e3)}function Je(){const t=document.getElementById("create-order-form"),e=document.getElementById("food-item"),n=document.getElementById("custom-item-name-group"),a=document.getElementById("custom-item-name"),s=document.getElementById("item-quantity"),i=document.getElementById("item-price"),r=document.getElementById("add-to-ticket-btn"),l=document.getElementById("order-downpayment"),c=document.getElementById("customize-item-toggle-group"),o=document.getElementById("customize-item-checkbox"),m=document.getElementById("item-customization-section"),d=document.getElementById("custom-inclusions-list"),h=document.getElementById("btn-add-inclusion");let u=[],p="Full";const f=g=>{p=g;const k=document.querySelector('input[name="tray-size"][value="Full"]'),w=document.querySelector('input[name="tray-size"][value="Half"]'),I=document.getElementById("toggle-size-full"),S=document.getElementById("toggle-size-half");I?.classList.toggle("active",g==="Full"),S?.classList.toggle("active",g==="Half"),k&&(k.checked=g==="Full"),w&&(w.checked=g==="Half");const E=e.options[e.selectedIndex];if(E&&E.value&&E.value!=="Custom Item"){const C=parseFloat(E.getAttribute("data-price")||"0");if(g==="Half"){const D=C/2+50;i.value=D.toFixed(2)}else i.value=C.toFixed(2)}},x=document.getElementById("toggle-size-full"),B=document.getElementById("toggle-size-half");x?.addEventListener("click",()=>f("Full")),B?.addEventListener("click",()=>f("Half"));const y=()=>{d&&(d.innerHTML=u.map((g,k)=>`
				<div class="inclusion-edit-row" style="display: flex; align-items: center; gap: 8px;">
					<input type="text" class="custom-inclusion-input" data-idx="${k}" value="${g.replace(/"/g,"&quot;")}" placeholder="Inclusion item description..." style="flex: 1; padding: 8px 12px; font-size: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); color: var(--text-primary);" />
					<button type="button" class="btn-delete-inclusion" data-idx="${k}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; transition: color 0.2s;" title="Remove Inclusion">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
					</button>
				</div>
			`).join(""),d.querySelectorAll(".custom-inclusion-input").forEach(g=>{g.addEventListener("input",k=>{const w=k.currentTarget.getAttribute("data-idx");if(w!==null){const I=parseInt(w);u[I]=k.currentTarget.value}})}),d.querySelectorAll(".btn-delete-inclusion").forEach(g=>{g.addEventListener("click",k=>{const w=k.currentTarget.getAttribute("data-idx");if(w!==null){const I=parseInt(w);u.splice(I,1),y()}})}))};h?.addEventListener("click",()=>{u.push(""),y()}),o?.addEventListener("change",()=>{if(o.checked){if(m&&(m.style.display="block"),u.length===0){const g=e.options[e.selectedIndex];u=Ie(g.value)||[]}y()}else m&&(m.style.display="none")});const b=document.getElementById("toggle-owner-label"),P=document.getElementById("toggle-customer-label"),z=document.getElementById("customer-details-section"),O=document.getElementById("submit-btn-text"),Y=document.getElementById("customer-name"),ae=document.getElementById("customer-contact"),ie=document.getElementById("customer-address"),se=document.getElementById("delivery-date-time"),he=g=>{te=g,g==="Owner"?(b?.classList.add("active"),P?.classList.remove("active"),z&&(z.style.display="block"),O&&(O.textContent="Submit Order"),Y?.setAttribute("required","required"),ae?.setAttribute("required","required"),ie?.setAttribute("required","required"),se?.setAttribute("required","required")):(b?.classList.remove("active"),P?.classList.add("active"),z&&(z.style.display="none"),O&&(O.textContent="Generate Customer Link"),Y?.removeAttribute("required"),ae?.removeAttribute("required"),ie?.removeAttribute("required"),se?.removeAttribute("required"))};b?.addEventListener("click",()=>he("Owner")),P?.addEventListener("click",()=>he("Customer"));const be=document.getElementById("toggle-pickup-label"),xe=document.getElementById("toggle-meetup-label"),ke=document.getElementById("toggle-delivery-label"),j=document.getElementById("delivery-fee-group"),M=document.getElementById("delivery-fee"),oe=g=>{Q=g;const k=document.querySelector('input[name="fulfillment-type"][value="Pickup"]'),w=document.querySelector('input[name="fulfillment-type"][value="Meetup"]'),I=document.querySelector('input[name="fulfillment-type"][value="Delivery"]');be?.classList.toggle("active",g==="Pickup"),xe?.classList.toggle("active",g==="Meetup"),ke?.classList.toggle("active",g==="Delivery"),k&&(k.checked=g==="Pickup"),w&&(w.checked=g==="Meetup"),I&&(I.checked=g==="Delivery"),g==="Pickup"?(j&&(j.style.display="none"),M&&(M.value="0.00")):g==="Meetup"?(j&&(j.style.display="block"),M&&(M.value="50.00")):(j&&(j.style.display="block"),M&&(M.value="100.00")),R(!0)};be?.addEventListener("click",()=>oe("Pickup")),xe?.addEventListener("click",()=>oe("Meetup")),ke?.addEventListener("click",()=>oe("Delivery")),M?.addEventListener("input",()=>{R(!1)}),e?.addEventListener("change",()=>{const g=e.options[e.selectedIndex],k=parseFloat(g.getAttribute("data-price")||"0");g.value==="Custom Item"?(n.style.display="block",a.setAttribute("required","required"),i.value="0.00"):(n.style.display="none",a.removeAttribute("required"),a.value="",i.value=k.toFixed(2));const w=e.value,I=["P1 Package (Bilao)","P2 Package (Bilao)","P3 Package (Bilao)","P4 Package (Bilao)","P5 Package (Bilao)","P6 Package (Bilao)"].includes(w),S=document.getElementById("belly-dessert-group"),E=document.getElementById("belly-dessert");S&&E&&(I?(S.style.display="block",E.setAttribute("required","required")):(S.style.display="none",E.removeAttribute("required"),E.selectedIndex=0,S.classList.remove("invalid")));const C=Ie(g.value);C&&C.length>0&&(c&&(c.style.display="block"),o&&(o.checked=!1),m&&(m.style.display="none"),u=[...C],u=[]);const D=g.parentElement,F=D&&D.label&&D.label.startsWith("Food Trays"),N=document.getElementById("foodtray-size-group");N&&(F?(N.style.display="block",f("Full")):(N.style.display="none",f("Full")))}),r?.addEventListener("click",()=>{if(!We())return;const g=e.options[e.selectedIndex];let w=g.value==="Custom Item"?a.value.trim():g.value;const I=["P1 Package (Bilao)","P2 Package (Bilao)","P3 Package (Bilao)","P4 Package (Bilao)","P5 Package (Bilao)","P6 Package (Bilao)"].includes(g.value),S=document.getElementById("belly-dessert");I&&S&&S.value&&(w=`${w} [Dessert: ${S.value}]`);const E=g.parentElement;E&&E.label&&E.label.startsWith("Food Trays")&&(w=`${w} (${p==="Half"?"Half Tray":"Full Tray"})`);const D=parseInt(s.value)||1,F=parseFloat(i.value)||0,N=D*F,le=o&&o.checked?u.filter(J=>J.trim()!==""):void 0,re={name:w,quantity:D,price:F,total:parseFloat(N.toFixed(2)),customInclusions:le};q.push(re),ve(),R(!0),e.selectedIndex=0,n.style.display="none",a.value="",s.value="1",i.value="";const H=document.getElementById("belly-dessert-group");H&&S&&(H.style.display="none",S.removeAttribute("required"),S.selectedIndex=0,H.classList.remove("invalid")),o&&(o.checked=!1),c&&(c.style.display="none"),m&&(m.style.display="none"),u=[];const K=document.getElementById("foodtray-size-group");K&&(K.style.display="none",f("Full")),e.parentElement?.parentElement?.classList.remove("invalid"),n.classList.remove("invalid"),i.parentElement?.parentElement?.classList.remove("invalid")}),l?.addEventListener("input",()=>{R(!1)}),t?.addEventListener("submit",async g=>{if(g.preventDefault(),!Qe())return;let k=0;v.forEach(A=>{const T=parseInt(A.id.replace("ORD-",""));T>k&&(k=T)});const I=`ORD-${(k+1).toString().padStart(3,"0")}`,S=document.getElementsByName("order-status");let E="Pending";S.forEach(A=>{A.checked&&(E=A.value)});const C=new Date,D=`${C.getFullYear()}-${(C.getMonth()+1).toString().padStart(2,"0")}-${C.getDate().toString().padStart(2,"0")} ${C.getHours().toString().padStart(2,"0")}:${C.getMinutes().toString().padStart(2,"0")}`,F=te==="Customer",N=F?"Pending Customer Details":Y.value.trim(),le=F?"":ie.value.trim(),re=F?"":ae.value.trim(),H=F?"":se.value,K=H?H.replace("T"," "):"",J=M&&parseFloat(M.value)||0,we=q.reduce((A,T)=>A+T.total,0)+J,Ee=parseFloat(l.value)||0,Te=parseFloat((we-Ee).toFixed(2)),L={id:I,date:D,customer:N,address:le,contact:re,deliveryDateTime:K,items:[...q],total:parseFloat(we.toFixed(2)),downpayment:parseFloat(Ee.toFixed(2)),balance:Te,status:E,fulfillmentType:Q,deliveryFee:J},{error:Le}=await G.from("orders").insert({id:L.id,date:L.date,customer:L.customer,address:L.address,contact:L.contact,delivery_date_time:L.deliveryDateTime||null,fulfillment_type:L.fulfillmentType??"Delivery",status:L.status,total:L.total,downpayment:L.downpayment,balance:L.balance,delivery_fee:L.deliveryFee??0});if(Le){console.error("Failed to save order:",Le.message),$("Failed to save order.");return}if(L.items.length>0){const{error:A}=await G.from("order_items").insert(L.items.map(T=>({order_id:L.id,name:T.name,quantity:T.quantity,price:T.price,total:T.total,custom_inclusions:T.customInclusions??[]})));A&&console.error("Failed to save order items:",A.message)}v.unshift(L),_(),document.getElementById("order-modal-overlay")?.classList.remove("active"),F?Ge(I):$("Order created successfully!"),De()})}function We(){let t=!0;const e=document.getElementById("food-item"),n=e?.parentElement?.parentElement;e.value?n?.classList.remove("invalid"):(n?.classList.add("invalid"),t=!1);const a=document.getElementById("custom-item-name-group"),s=document.getElementById("custom-item-name");a&&a.style.display==="block"&&(s.value.trim()?a.classList.remove("invalid"):(a.classList.add("invalid"),t=!1));const i=document.getElementById("belly-dessert-group"),r=document.getElementById("belly-dessert");i&&i.style.display==="block"&&(r.value?i.classList.remove("invalid"):(i.classList.add("invalid"),t=!1));const l=document.getElementById("item-price"),c=l?.parentElement?.parentElement,o=parseFloat(l.value);return isNaN(o)||o<0?(c?.classList.add("invalid"),t=!1):c?.classList.remove("invalid"),t}function ve(){const t=document.getElementById("ticket-items-list");if(t){if(q.length===0){t.innerHTML=`
				<div class="ticket-empty-state" id="ticket-empty-state">
					No items added to this ticket yet.
				</div>
			`;return}t.innerHTML=q.map((e,n)=>{const a=e.customInclusions&&e.customInclusions.length>0?`
				<div class="ticket-item-customizations" style="margin-top: 4px; padding-left: 12px; font-size: 0.75rem; color: var(--accent-primary); border-left: 2px solid var(--accent-primary);">
					<div style="font-weight: 700; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 2px;">Custom Inclusions:</div>
					<ul style="margin: 0; padding-left: 12px; list-style-type: disc; color: var(--text-secondary);">
						${e.customInclusions.map(s=>`<li>${s}</li>`).join("")}
					</ul>
				</div>
			`:"";return`
				<div class="ticket-item-wrapper" style="border-bottom: 1px solid rgba(255, 255, 255, 0.03); padding-bottom: 8px; margin-bottom: 8px;">
					<div class="ticket-item-row" style="border-bottom: none; padding-bottom: 0;">
						<div class="ticket-item-info">
							<span class="ticket-item-name">${e.name}</span>
							<span class="ticket-item-meta">${e.quantity}x @ ₱${e.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
						</div>
						<div class="ticket-item-right" style="display: flex; align-items: center; gap: 12px;">
							<span class="ticket-item-total">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
							<button type="button" class="btn-remove-item" data-idx="${n}" title="Remove Item">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
							</button>
						</div>
					</div>
					${a}
				</div>
			`}).join(""),t.querySelectorAll(".btn-remove-item").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-idx");if(a!==null){const s=parseInt(a);q.splice(s,1),ve(),R(!0)}})})}}function R(t=!0){const e=document.getElementById("order-downpayment"),n=document.getElementById("delivery-fee"),a=document.getElementById("total-val"),s=document.getElementById("downpayment-val"),i=document.getElementById("balance-val");if(!a||!s||!i||!e)return;const r=q.reduce((d,h)=>d+h.total,0),l=n&&parseFloat(n.value)||0,c=r+l;t&&(e.value=(c*.5).toFixed(2));const o=parseFloat(e.value)||0,m=Math.max(0,c-o);a.textContent=`₱${c.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,s.textContent=`₱${o.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,i.textContent=`₱${m.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function Qe(){let t=!0;if(te==="Owner"){const l=document.getElementById("customer-name"),c=l?.parentElement?.parentElement;l&&!l.value.trim()?(c?.classList.add("invalid"),t=!1):c?.classList.remove("invalid");const o=document.getElementById("customer-contact"),m=o?.parentElement?.parentElement;o&&!o.value.trim()?(m?.classList.add("invalid"),t=!1):m?.classList.remove("invalid");const d=document.getElementById("customer-address"),h=d?.parentElement?.parentElement;d&&!(Q==="Pickup")&&!d.value.trim()?(h?.classList.add("invalid"),t=!1):h?.classList.remove("invalid");const p=document.getElementById("delivery-date-time"),f=p?.parentElement?.parentElement;p&&!p.value?(f?.classList.add("invalid"),t=!1):f?.classList.remove("invalid")}const e=document.getElementById("delivery-fee"),n=e?.parentElement?.parentElement;if(e&&Q!=="Pickup"){const l=parseFloat(e.value);isNaN(l)||l<0?(n?.classList.add("invalid"),t=!1):n?.classList.remove("invalid")}const a=document.getElementById("order-downpayment"),s=a?.parentElement?.parentElement,i=parseFloat(a?.value);a&&(isNaN(i)||i<0)?(s?.classList.add("invalid"),t=!1):s?.classList.remove("invalid");const r=document.querySelector(".ticket-items-container");return q.length===0?(r?.classList.add("invalid"),t=!1):r?.classList.remove("invalid"),t}function De(){const t=document.getElementById("create-order-form");t&&t.reset();const e=document.getElementById("custom-item-name-group");e&&(e.style.display="none");const n=document.getElementById("foodtray-size-group");if(n){n.style.display="none";const y=document.querySelector('input[name="tray-size"][value="Full"]');y&&(y.checked=!0);const b=document.getElementById("toggle-size-full"),P=document.getElementById("toggle-size-half");b?.classList.add("active"),P?.classList.remove("active")}const a=document.getElementById("belly-dessert-group"),s=document.getElementById("belly-dessert");a&&s&&(a.style.display="none",s.removeAttribute("required"),s.selectedIndex=0),q=[],ve(),te="Owner";const i=document.getElementById("toggle-owner-label"),r=document.getElementById("toggle-customer-label"),l=document.getElementById("customer-details-section"),c=document.getElementById("submit-btn-text"),o=document.getElementById("customer-name"),m=document.getElementById("customer-contact"),d=document.getElementById("customer-address"),h=document.getElementById("delivery-date-time");i?.classList.add("active"),r?.classList.remove("active"),l&&(l.style.display="block"),c&&(c.textContent="Submit Order"),o?.setAttribute("required","required"),m?.setAttribute("required","required"),d?.setAttribute("required","required"),h?.setAttribute("required","required"),document.querySelectorAll(".form-group").forEach(y=>{y.classList.remove("invalid")}),document.querySelector(".ticket-items-container")?.classList.remove("invalid");const u=document.getElementById("toggle-pickup-label"),p=document.getElementById("toggle-meetup-label"),f=document.getElementById("toggle-delivery-label"),x=document.getElementById("delivery-fee-group"),B=document.getElementById("delivery-fee");if(u&&p&&f&&x&&B){Q="Pickup";const y=document.querySelector('input[name="fulfillment-type"][value="Pickup"]');y&&(y.checked=!0),u.classList.add("active"),p.classList.remove("active"),f.classList.remove("active"),x.style.display="none",B.value="0.00"}R(!0)}const Ke={dashboard:"Order Dashboard","order-history":"Order History",analytics:"Analytics","live-kitchen":"Live Kitchen",settings:"Settings"};let ee=null;function Xe(t){document.querySelectorAll(".view-container").forEach(s=>s.style.display="none");const e=document.getElementById(`view-${t}`);e&&(e.style.display="flex"),document.querySelectorAll(".nav-item").forEach(s=>s.classList.remove("active")),document.querySelector(`.nav-item[data-view="${t}"]`)?.classList.add("active");const n=document.getElementById("page-title");n&&(n.textContent=Ke[t]||t);const a=document.getElementById("open-order-modal-btn");a&&(a.style.display=t==="dashboard"?"":"none"),t!=="live-kitchen"&&ee&&(clearInterval(ee),ee=null),t==="order-history"&&W(),t==="analytics"&&tt(),t==="live-kitchen"&&(ne(),ee=setInterval(ne,3e4)),t==="settings"&&nt()}function Ze(){document.querySelectorAll(".nav-item[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const n=t.getAttribute("data-view");Xe(n)})})}let ce="All",de="",me="",ue="";function W(){["All","Pending","Preparing","Completed","Cancelled"].forEach(o=>{const m=document.getElementById(`hcount-${o.toLowerCase()}`);m&&(m.textContent=o==="All"?v.length.toString():v.filter(d=>d.status===o).length.toString())});let e=[...v];if(ce!=="All"&&(e=e.filter(o=>o.status===ce)),de.trim()){const o=de.toLowerCase();e=e.filter(m=>m.id.toLowerCase().includes(o)||m.customer.toLowerCase().includes(o))}me&&(e=e.filter(o=>(o.deliveryDateTime||o.date)>=me)),ue&&(e=e.filter(o=>(o.deliveryDateTime||o.date)<=ue+"T23:59")),e.sort((o,m)=>m.date.localeCompare(o.date));const n=document.getElementById("history-body"),a=document.getElementById("history-empty");if(!n||!a)return;e.length===0?(n.innerHTML="",a.style.display="flex"):(a.style.display="none",n.innerHTML=e.map(o=>{const m=o.items.map(h=>`<div class="history-item-pill">${h.quantity}x ${h.name}</div>`).join(""),d=`badge-${o.status.toLowerCase()}`;return`<tr>
					<td style="font-weight:700;color:var(--accent-primary)">#${o.id.replace("ORD-","")}</td>
					<td>${o.customer}</td>
					<td><div class="history-items-list">${m}</div></td>
					<td style="font-weight:700">₱${o.total.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
					<td style="color:var(--status-preparing)">₱${o.downpayment.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
					<td style="color:var(--accent-primary)">₱${o.balance.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
					<td style="color:var(--text-secondary);font-size:0.8rem">${o.deliveryDateTime||o.date}</td>
					<td><span class="status-badge ${d}">${o.status}</span></td>
					<td><button class="action-btn btn-view-details" data-id="${o.id}" title="View Details" style="padding:6px">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
					</button></td>
				</tr>`}).join(""),n.querySelectorAll(".btn-view-details").forEach(o=>{o.addEventListener("click",m=>{const d=m.currentTarget.getAttribute("data-id");d&&U(d)})}));const s=document.getElementById("history-tabs");s&&!s.dataset.bound&&(s.dataset.bound="1",s.querySelectorAll(".filter-tab").forEach(o=>{o.addEventListener("click",()=>{s.querySelectorAll(".filter-tab").forEach(m=>m.classList.remove("active")),o.classList.add("active"),ce=o.getAttribute("data-status")||"All",W()})}));const i=document.getElementById("history-search");i&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>{de=i.value,W()}));const r=document.getElementById("history-from"),l=document.getElementById("history-to");r&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("change",()=>{me=r.value,W()})),l&&!l.dataset.bound&&(l.dataset.bound="1",l.addEventListener("change",()=>{ue=l.value,W()}));const c=document.getElementById("export-csv-btn");c&&!c.dataset.bound&&(c.dataset.bound="1",c.addEventListener("click",()=>et(e)))}function et(t){const n=[["Order #","Customer","Items","Total","Downpayment","Balance","Delivery Date","Status"].join(","),...t.map(i=>[i.id,`"${i.customer}"`,`"${i.items.map(r=>`${r.quantity}x ${r.name}`).join("; ")}"`,i.total,i.downpayment,i.balance,`"${i.deliveryDateTime||i.date}"`,i.status].join(","))],a=new Blob([n.join(`
`)],{type:"text/csv"}),s=document.createElement("a");s.href=URL.createObjectURL(a),s.download=`orders_${new Date().toISOString().slice(0,10)}.csv`,s.click()}function tt(){const t=v.filter(d=>d.status!=="Cancelled"),e=t.filter(d=>d.status==="Completed"),n=e.reduce((d,h)=>d+h.total,0),a=e.length?n/e.length:0,s=v.length?Math.round(e.length/v.length*100):0,i=t.length?Math.max(...t.map(d=>d.total)):0,r=document.getElementById("analytics-summary");r&&(r.innerHTML=[{label:"Total Revenue",value:`₱${n.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"from completed orders"},{label:"Completion Rate",value:`${s}%`,sub:`${e.length} of ${v.length} orders`},{label:"Avg Order Value",value:`₱${a.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"completed orders"},{label:"Highest Order",value:`₱${i.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"single order"}].map(d=>`<div class="analytic-card"><span class="a-label">${d.label}</span><span class="a-value">${d.value}</span><span class="a-sub">${d.sub}</span></div>`).join(""));const l=document.getElementById("revenue-bar-chart");if(l){const d=t.length?Math.max(...t.map(u=>u.total)):1,h={Pending:"#f59e0b",Preparing:"#f97316",Completed:"#10b981",Cancelled:"#ef4444"};l.innerHTML=t.slice(-20).map(u=>{const p=Math.max(4,Math.round(u.total/d*140)),f=h[u.status]||"#d92b3a";return`<div class="bar-wrap" title="${u.id}: ₱${u.total.toLocaleString()}">
					<div class="bar-fill" style="height:${p}px;background:${f}"></div>
					<span class="bar-id">${u.id.replace("ORD-","")}</span>
				</div>`}).join("")||'<span style="color:var(--text-muted);font-size:0.8rem;padding:16px">No orders yet.</span>'}const c=document.getElementById("status-donut"),o=document.getElementById("donut-legend");if(c&&o){const d={Pending:{count:0,color:"#f59e0b"},Preparing:{count:0,color:"#f97316"},Completed:{count:0,color:"#10b981"},Cancelled:{count:0,color:"#ef4444"}};v.forEach(b=>{d[b.status]&&d[b.status].count++});const h=v.length||1;let u=25;const p=40,f=60,x=60,B=2*Math.PI*p,y=Object.entries(d).filter(([,b])=>b.count>0).map(([b,P])=>{const z=P.count/h,O=B*z,Y=`<circle cx="${f}" cy="${x}" r="${p}" fill="none" stroke="${P.color}" stroke-width="14" stroke-dasharray="${O} ${B-O}" stroke-dashoffset="${-B*(u/100)}" style="transform-origin:center;transform:rotate(-90deg)"/>`;return u+=z*100,{seg:Y,label:b,v:P}});c.innerHTML=`<svg width="120" height="120" viewBox="0 0 120 120">${y.map(b=>b.seg).join("")}<circle cx="${f}" cy="${x}" r="26" fill="var(--bg-primary)"/><text x="${f}" y="${x+2}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-primary)" font-size="13" font-weight="800">${v.length}</text><text x="${f}" y="${x+16}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-muted)" font-size="7">orders</text></svg>`,o.innerHTML=y.map(b=>`<div class="legend-item"><div class="legend-dot" style="background:${b.v.color}"></div><span>${b.label}: <strong>${b.v.count}</strong></span></div>`).join("")}const m=document.getElementById("analytics-top-items");if(m){const d={};t.forEach(u=>u.items.forEach(p=>{d[p.name]||(d[p.name]={qty:0,rev:0}),d[p.name].qty+=p.quantity,d[p.name].rev+=p.total}));const h=Object.entries(d).sort((u,p)=>p[1].qty-u[1].qty).slice(0,6);m.innerHTML=h.map(([u,p],f)=>`<div class="analytics-top-item">
				<span class="ati-rank">#${f+1}</span>
				<span class="ati-name">${u}</span>
				<span class="ati-qty">${p.qty} sold</span>
				<span class="ati-rev">₱${p.rev.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
			</div>`).join("")||'<span style="color:var(--text-muted);font-size:0.8rem;padding:8px">No sales data.</span>'}}function ne(){const t=v.filter(p=>p.status==="Pending"||p.status==="Preparing").sort((p,f)=>p.date.localeCompare(f.date)),e=document.getElementById("kitchen-pending-count"),n=document.getElementById("kitchen-preparing-count"),a=t.filter(p=>p.status==="Pending"),s=t.filter(p=>p.status==="Preparing");e&&(e.textContent=`${a.length} Pending`),n&&(n.textContent=`${s.length} Preparing`);const i=document.getElementById("kcol-pending-count"),r=document.getElementById("kcol-preparing-count");i&&(i.textContent=a.length.toString()),r&&(r.textContent=s.length.toString());const l=document.getElementById("kds-pending-body"),c=document.getElementById("kds-preparing-body"),o=document.getElementById("kds-pending-empty"),m=document.getElementById("kds-preparing-empty"),d=document.querySelector(".kds-board"),h=document.getElementById("kitchen-empty");if(!l||!c||!o||!m||!d||!h)return;if(t.length===0)d.style.display="none",h.style.display="flex";else{if(d.style.display="grid",h.style.display="none",a.length===0)l.innerHTML="",o.style.display="flex";else{o.style.display="none";const f=new Date;l.innerHTML=a.map(x=>Se(x,f)).join("")}if(s.length===0)c.innerHTML="",m.style.display="flex";else{m.style.display="none";const f=new Date;c.innerHTML=s.map(x=>Se(x,f)).join("")}const p=f=>{f.querySelectorAll("[data-action]").forEach(x=>{x.addEventListener("click",B=>{const y=B.currentTarget.getAttribute("data-id"),b=B.currentTarget.getAttribute("data-action");if(b==="details"){U(y);return}b==="prepare"&&V(y,"Preparing"),b==="complete"&&V(y,"Completed"),b==="cancel"&&V(y,"Cancelled"),ne(),_()})})};p(l),p(c)}const u=document.getElementById("kitchen-refresh-btn");u&&!u.dataset.bound&&(u.dataset.bound="1",u.addEventListener("click",()=>ne()))}function Se(t,e){const n=new Date(t.date.replace(" ","T")),a=isNaN(n.getTime())?0:Math.floor((e.getTime()-n.getTime())/6e4),s=a<60?`${a}m ago`:`${Math.floor(a/60)}h ${a%60}m ago`,i=t.items.map(l=>{const c=l.customInclusions&&l.customInclusions.length>0?`
				<div class="kcard-item-inclusions" style="font-size: 0.7rem; color: var(--accent-primary); margin-top: 2px; padding-left: 8px; border-left: 1.5px solid var(--accent-primary); font-style: italic; opacity: 0.9;">
					+ ${l.customInclusions.join(", ")}
				</div>
			`:"";return`
				<div style="margin-bottom: 6px;">
					<div class="kcard-item" style="margin-bottom: 0;"><strong>${l.quantity}x</strong> ${l.name}</div>
					${c}
				</div>
			`}).join(""),r=t.status==="Pending";return`<div class="kitchen-card status-${t.status.toLowerCase()}">
			<div class="kcard-header">
				<span class="kcard-id">#${t.id.replace("ORD-","")}</span>
				<div style="display:flex;align-items:center;gap:8px">
					<span class="kcard-timer">${s}</span>
					<button class="kcard-btn-details" data-id="${t.id}" data-action="details" title="View Full Details">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
					</button>
				</div>
			</div>
			<div class="kcard-customer">👤 ${t.customer==="Pending Customer Details"?"Customer TBD":t.customer}</div>
			<div class="kcard-items">${i}</div>
			<div class="kcard-actions">
				${r?`<button class="kcard-btn kcard-btn-prepare" data-id="${t.id}" data-action="prepare">▶ Prepare</button>`:""}
				${r?"":`<button class="kcard-btn kcard-btn-complete" data-id="${t.id}" data-action="complete">✓ Complete</button>`}
				<button class="kcard-btn kcard-btn-cancel" data-id="${t.id}" data-action="cancel">✕ Cancel</button>
			</div>
		</div>`}const Fe="flavorflow_settings",Ce={maribankName:"Christy Montejo",maribankNum:"11953471393",gcashName:"Christy Montejo",gcashNum:"09760721404",dpPct:50};function pe(){try{return{...Ce,...JSON.parse(localStorage.getItem(Fe)||"{}")}}catch{return{...Ce}}}function $e(t){localStorage.setItem(Fe,JSON.stringify(t))}function nt(){const t=pe();[["s-maribank-name","maribankName"],["s-maribank-num","maribankNum"],["s-gcash-name","gcashName"],["s-gcash-num","gcashNum"],["s-dp-pct","dpPct"]].forEach(([i,r])=>{const l=document.getElementById(i);l&&!l.dataset.bound&&(l.value=String(t[r]))});const n=document.getElementById("save-payment-btn");n&&!n.dataset.bound&&(n.dataset.bound="1",n.addEventListener("click",()=>{const i=pe();i.maribankName=document.getElementById("s-maribank-name")?.value||i.maribankName,i.maribankNum=document.getElementById("s-maribank-num")?.value||i.maribankNum,i.gcashName=document.getElementById("s-gcash-name")?.value||i.gcashName,i.gcashNum=document.getElementById("s-gcash-num")?.value||i.gcashNum,$e(i),$("Payment info saved!")}));const a=document.getElementById("save-dp-btn");a&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("click",()=>{const i=pe(),r=parseFloat(document.getElementById("s-dp-pct")?.value);!isNaN(r)&&r>=0&&r<=100?(i.dpPct=r,$e(i),$(`Default downpayment set to ${r}%`)):$("Enter a valid percentage (0–100)")}));const s=document.getElementById("clear-orders-btn");s&&!s.dataset.bound&&(s.dataset.bound="1",s.addEventListener("click",async()=>{if(confirm("Clear ALL orders from the database? This cannot be undone.")){const{error:i}=await G.from("orders").delete().neq("id","");if(i){$("Failed to clear orders.");return}v=[],_(),$("All orders cleared.")}}))}
