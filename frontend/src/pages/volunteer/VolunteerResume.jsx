import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { 
  Download, Share2, Plus, Trash2, 
  MapPin, Mail, Phone, Calendar, Award, BookOpen 
} from 'lucide-react';

const VolunteerResume = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' });

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      // Calls your backend: getMyResume
      const { data } = await api.get('/volunteer-resume');
      setResume(data.data);
    } catch (error) {
      console.error("Failed to load resume", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print(); // Triggers browser PDF save
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name) return;
    try {
      // Calls your backend: addSkill
      await api.post('/volunteer-resume/add-skill', {
        name: newSkill.name,
        proficiency: newSkill.proficiency,
        icon: 'star', // Default icon
        tasksCompleted: 0
      });
      setNewSkill({ name: '', proficiency: 'Intermediate' });
      setShowSkillForm(false);
      fetchResume(); // Refresh data
    } catch (error) {
      alert("Failed to add skill");
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/resume/share/${resume.uniqueLink}`;
    navigator.clipboard.writeText(url);
    alert("Resume link copied to clipboard!");
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Resume...</div>;
  if (!resume) return <div className="p-10 text-center">Resume data unavailable.</div>;

  const { userId: user } = resume;

  return (
    <Layout userRole="Volunteer" showBackButton={true}>
      
      {/* --- CONTROLS (Hidden when printing) --- */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-4 justify-between items-center print:hidden px-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Volunteer Resume</h1>
          <p className="text-sm text-slate-500">Auto-generated from your service record</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={copyShareLink}
            className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Share2 size={18} /> Share Link
          </button>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* --- RESUME DOCUMENT (A4 Scaled) --- */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none rounded-xl overflow-hidden min-h-[297mm] relative">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-10 print:p-8 flex justify-between items-start">
          <div className="flex gap-6 items-center">
            {/* Photo (Rounded for web, square for print usually, but let's keep it round) */}
            <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-slate-800">
               <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wider mb-1">{user.name}</h1>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">NSS Volunteer &bull; {user.branch} {user.year}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Mail size={12}/> {user.email}</span>
                {/* Add phone if available in user object */}
                <span className="flex items-center gap-1.5"><MapPin size={12}/> NSS Unit, {user.branch || 'College'}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
             <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Impact Score</p>
                <p className="text-2xl font-black text-white">{resume.totalXP} <span className="text-xs text-blue-400">XP</span></p>
             </div>
          </div>
        </div>

        <div className="p-10 print:p-8 grid grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Main Content) */}
          <div className="col-span-2 space-y-8">
            
            {/* SUMMARY */}
            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase border-b-2 border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" /> Executive Summary
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed text-justify">
                Dedicated National Service Scheme (NSS) volunteer with <strong>{resume.totalHours} hours</strong> of community service. 
                Actively contributed to {resume.domainsContributed.length} social domains and participated in {resume.eventsAttended.length} major events. 
                Demonstrated strong commitment to social welfare, leadership, and team collaboration.
              </p>
            </section>

            {/* EXPERIENCE (Tasks/Events) */}
            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" /> Event Participation
              </h3>
              <div className="space-y-4">
                {resume.eventsAttended.length === 0 ? <p className="text-xs text-slate-400 italic">No events recorded yet.</p> : 
                  resume.eventsAttended.map((eventObj, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-col items-center hidden print:flex">
                       <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
                       <div className="w-[1px] h-full bg-slate-200 flex-1 my-1 ml-1"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{eventObj.eventId?.title || "Community Event"}</h4>
                      <p className="text-xs text-blue-600 font-bold mb-1">
                        {new Date(eventObj.eventId?.date || Date.now()).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-600">
                        Participated as an active volunteer, contributing to the successful execution of the event objectives.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DOMAINS */}
            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Award size={16} className="text-blue-600" /> Key Domains
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.domainsContributed.length === 0 ? <p className="text-xs text-slate-400 italic">No domains recorded.</p> :
                  resume.domainsContributed.map((domain, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">
                    {domain.domainId?.name || "General Service"}
                  </span>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="col-span-1 space-y-8">
            
            {/* STATS */}
            <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-center print:bg-white print:border-slate-200 print:p-0 print:text-left print:rounded-none">
              <h3 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-4 print:text-slate-900 print:mb-2 print:border-b-2 print:border-slate-200 print:pb-2">
                At a Glance
              </h3>
              <div className="space-y-3 print:space-y-1">
                <div className="flex justify-between print:justify-start print:gap-2">
                  <span className="text-xs font-bold text-slate-500">Level</span>
                  <span className="text-sm font-black text-slate-900">{resume.level}</span>
                </div>
                <div className="flex justify-between print:justify-start print:gap-2">
                  <span className="text-xs font-bold text-slate-500">Hours</span>
                  <span className="text-sm font-black text-slate-900">{resume.totalHours}</span>
                </div>
                <div className="flex justify-between print:justify-start print:gap-2">
                  <span className="text-xs font-bold text-slate-500">Events</span>
                  <span className="text-sm font-black text-slate-900">{resume.eventsAttended.length}</span>
                </div>
              </div>
            </section>

            {/* SKILLS */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b-2 border-slate-200 pb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase">Core Skills</h3>
                <button onClick={() => setShowSkillForm(true)} className="print:hidden text-blue-600 hover:bg-blue-50 p-1 rounded">
                  <Plus size={16}/>
                </button>
              </div>
              
              {showSkillForm && (
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 print:hidden">
                  <input 
                    type="text" 
                    placeholder="Skill Name (e.g. Leadership)" 
                    className="w-full p-2 text-xs border rounded mb-2"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                  />
                  <select 
                    className="w-full p-2 text-xs border rounded mb-2"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <button onClick={handleAddSkill} className="w-full bg-slate-900 text-white text-xs py-2 rounded font-bold">Add</button>
                </div>
              )}

              <div className="space-y-3">
                {resume.topSkills.length === 0 ? <p className="text-xs text-slate-400 italic">No skills added.</p> :
                  resume.topSkills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">{skill.name}</span>
                      <span className="text-slate-500">{skill.proficiency}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-slate-800 h-full rounded-full" 
                        style={{ width: skill.proficiency === 'Advanced' ? '90%' : skill.proficiency === 'Intermediate' ? '60%' : '30%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* VERIFICATION */}
            <section className="pt-8 mt-8 border-t border-dashed border-slate-300 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Verified By</p>
              <div className="h-12 mb-2 flex items-end justify-center">
                 <span className="font-script text-xl text-slate-900" style={{fontFamily: 'cursive'}}>Program Officer</span>
              </div>
              <div className="w-32 h-[1px] bg-slate-900 mx-auto mb-1"></div>
              <p className="text-[8px] text-slate-500 font-bold uppercase">NSS Program Officer</p>
              <p className="text-[8px] text-slate-400 mt-4">Generated on {new Date().toLocaleDateString()}</p>
            </section>

          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-\\[210mm\\] { width: 100%; max-width: none; box-shadow: none; margin: 0; position: absolute; left: 0; top: 0; }
          .max-w-\\[210mm\\], .max-w-\\[210mm\\] * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
    </Layout>
  );
};

export default VolunteerResume;