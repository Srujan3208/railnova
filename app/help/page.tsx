'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Headphones,Send,MessageCircle,Mail,Phone,Clock3,ShieldCheck,TrainFront,MapPin,Ticket,ExternalLink,FileText,CheckCircle2,AlertTriangle,LifeBuoy} from 'lucide-react';
import './help.css';

type TicketItem={id:string,topic:string,subject:string,message:string,status:string,created:string,contact:string,pnr:string,train:string};
const topics=['Booking / ticket issue','PNR or train status','Cancellation / refund','Payment deducted / ticket not booked','Seat / coach / passenger details','Change boarding station','Cleanliness / water / washroom','Food / catering','Medical assistance','Security / harassment / theft','Staff behaviour','Accessibility / senior citizen assistance','Website / account / technical issue','Other'];
const railmadad='https://railmadad.indianrailways.gov.in/madad/final/home.jsp';
export default function HelpPage(){
 const [topic,setTopic]=useState('Booking / ticket issue'),[subject,setSubject]=useState(''),[body,setBody]=useState(''),[contact,setContact]=useState(''),[pnr,setPnr]=useState(''),[train,setTrain]=useState(''),[items,setItems]=useState<TicketItem[]>([]),[notice,setNotice]=useState('');
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('railnova-help-tickets')||'[]'))}catch{}},[]);
 const submit=()=>{if(subject.trim().length<4||body.trim().length<12){setNotice('Please add a clear subject and at least 12 characters describing the issue.');return}const next:TicketItem[]=[{id:'RN-'+Date.now().toString().slice(-8),topic,subject:subject.trim(),message:body.trim(),status:'Saved on this device',created:new Date().toLocaleString('en-IN'),contact:contact.trim(),pnr:pnr.trim(),train:train.trim()},...items];setItems(next);localStorage.setItem('railnova-help-tickets',JSON.stringify(next));setSubject('');setBody('');setPnr('');setTrain('');setNotice('Request saved on this device only. It has NOT been sent to RAILNOVA staff or Indian Railways. For an official railway complaint, use RailMadad below or call 139.');};
 return <main className="help-page">
  <header><Link href="/" className="hp-brand"><TrainFront/> RAIL<span>NOVA</span></Link><Link href="/"><ArrowLeft/> Back to home</Link></header>
  <div className="hp-wrap">
   <div className="hp-intro"><small>PASSENGER ASSISTANCE</small><h1>Help Desk & Railway Support</h1><p>Find the official Indian Railways helpline, raise an issue and keep track of requests saved in this browser.</p></div>
   <section className="hp-emergency"><div className="hp-139"><div className="hp-phone-icon"><Phone/></div><div><small>INDIAN RAILWAYS — INTEGRATED HELPLINE</small><h2>139</h2><p>24×7 railway enquiry, assistance and complaints</p></div><a href="tel:139">Call 139 <Phone/></a></div><div className="hp-menu"><b>Useful IVR options</b><span><strong>1</strong> Security & medical assistance</span><span><strong>2</strong> Train / PNR / enquiry</span><span><strong>3</strong> Catering complaints</span><span><strong>4</strong> General complaints</span><span><strong>5</strong> Vigilance complaints</span><span><strong>6</strong> Accident-related queries</span><span><strong>7</strong> IRCTC-operated train queries</span><span><strong>9</strong> Complaint status</span><span><strong>*</strong> Speak to a call-centre executive</span></div></section>
   <div className="hp-official"><a href={railmadad} target="_blank" rel="noreferrer"><ExternalLink/><span><b>RailMadad — lodge an official complaint</b><small>Submit a grievance to Indian Railways and use its reference number to track progress.</small></span><ArrowLeft/></a><a href="sms:139"><MessageCircle/><span><b>SMS to 139</b><small>Railway assistance is also available through the integrated 139 service.</small></span></a><a href="https://pgportal.gov.in/" target="_blank" rel="noreferrer"><FileText/><span><b>CPGRAMS public grievance portal</b><small>For eligible public grievances requiring government grievance redressal.</small></span><ExternalLink/></a></div>
   <div className="hp-grid">
    <section className="hp-card"><h2><MessageCircle/> Raise an issue with RAILNOVA</h2><p className="hp-disclaimer">This form currently saves a draft locally in this browser. It does not submit to Indian Railways or a staffed RAILNOVA help team. Use the RailMadad link above for an official railway complaint.</p>
     <label>Issue category<select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(x=><option key={x}>{x}</option>)}</select></label>
     <div className="hp-two"><label>PNR number (optional)<input value={pnr} maxLength={10} inputMode="numeric" onChange={e=>setPnr(e.target.value.replace(/\D/g,''))} placeholder="10-digit PNR"/></label><label>Train number (optional)<input value={train} onChange={e=>setTrain(e.target.value.replace(/\D/g,''))} placeholder="e.g. 12620"/></label></div>
     <label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Briefly describe the issue"/></label>
     <label>Issue details<textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} placeholder="Describe what happened, when and where. Do not include passwords, OTPs, card details or UPI PINs."/></label>
     <label>Contact email or phone (optional)<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="How can we contact you?"/></label>
     <button className="hp-submit" onClick={submit}><Send/> Save issue draft</button>{notice&&<p className="hp-notice" role="status">{notice}</p>}
    </section>
    <aside className="hp-side"><h2><LifeBuoy/> When to use each channel</h2>
     <div><Phone/><span><b>Urgent help during a journey</b><small>Call 139. Choose option 1 for security or medical assistance.</small></span></div>
     <div><ShieldCheck/><span><b>Security concern</b><small>Call 139 and choose option 1. For immediate danger, seek railway staff / RPF assistance at the station or on the train.</small></span></div>
     <div><Ticket/><span><b>Ticket, PNR or train enquiry</b><small>Call 139 and choose option 2. You can also use the official RailMadad portal.</small></span></div>
     <div><Clock3/><span><b>Track a submitted complaint</b><small>Keep the RailMadad complaint reference number (CRN). Use the official portal or 139 complaint-status option.</small></span></div>
     <div className="hp-warning"><AlertTriangle/><small>Older numbers such as 182 and 138 have been merged into the integrated 139 service. Use 139 rather than relying on old posters or saved contacts.</small></div>
    </aside>
   </div>
   <section className="hp-history"><h2>My saved RAILNOVA issue drafts</h2>{items.length?items.map(t=><article key={t.id}><div><b>{t.subject}</b><small>{t.id} · {t.topic} · {t.created}</small><p>{t.message}</p>{(t.pnr||t.train)&&<small>{t.pnr?'PNR: '+t.pnr+' · ':''}{t.train?'Train: '+t.train:''}</small>}</div><span>{t.status}</span></article>):<p>No issue drafts saved on this device.</p>}</section>
   <p className="hp-footnote"><ShieldCheck/> RAILNOVA is an independent rail travel concept and is not affiliated with Indian Railways or IRCTC. Official railway assistance is provided through Indian Railways channels.</p>
  </div>
 </main>
}