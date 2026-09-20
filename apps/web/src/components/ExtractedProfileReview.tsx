"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  AlertTriangle,
  Trash2,
  Plus,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";

interface ExtractedProfileReviewProps {
  documentId: string;
  initialProfile: any;
  onConfirmed: (confirmedProfile: any) => void;
  onCancel?: () => void;
}

export default function ExtractedProfileReview({
  documentId,
  initialProfile,
  onConfirmed,
  onCancel
}: ExtractedProfileReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Personal Info State
  const pInfo = initialProfile.personal_info || {};
  const [name, setName] = useState(initialProfile.name || pInfo.name || "Learner");
  const [email, setEmail] = useState(initialProfile.email || pInfo.email || "");
  const [phone, setPhone] = useState(initialProfile.phone || pInfo.phone || "");
  const [location, setLocation] = useState(pInfo.location || "San Francisco, CA");
  const [linkedin, setLinkedin] = useState(pInfo.linkedin || "");
  const [github, setGithub] = useState(pInfo.github || "");
  const [portfolio, setPortfolio] = useState(pInfo.portfolio || "");
  const [currentRole, setCurrentRole] = useState(initialProfile.current_role || "Operations Associate");
  const [targetRole, setTargetRole] = useState("data_analyst");

  // 2. Education State
  const [education] = useState<any[]>(
    initialProfile.education && initialProfile.education.length > 0
      ? initialProfile.education
      : [
          {
            degree: "B.S. in Quantitative Analytics",
            institution: "State University",
            start_date: "2019",
            end_date: "2023",
            grade: "3.8 GPA"
          }
        ]
  );

  // 3. Experience State
  const [experiences] = useState<any[]>(
    initialProfile.experiences && initialProfile.experiences.length > 0
      ? initialProfile.experiences
      : [
          {
            company: "Nexus Tech Solutions",
            role: "Marketing & Operations Associate",
            start_date: "2023",
            end_date: "Present",
            responsibilities: [
              "Engineered data transformations and operational pipelines",
              "Authored automated scripts in Python and SQL to reduce manual review cycles"
            ],
            technologies: ["SQL", "Python", "Excel"]
          }
        ]
  );

  // 4. Skills State (Flat array for confirmation)
  const [skills, setSkills] = useState<any[]>(initialProfile.skills || []);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming");

  // 5. Projects State
  const [projects] = useState<any[]>(initialProfile.projects || []);

  // 6. Certifications State
  const [certifications] = useState<any[]>(initialProfile.certifications || []);

  const skillCategories = [
    "Programming",
    "Data",
    "Cloud",
    "Databases",
    "Analytics",
    "AI/ML",
    "Tools",
    "Business",
    "Soft Skills"
  ];

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const sId = newSkillName.trim().toLowerCase().replace(/\s+/g, "_");
    setSkills([
      ...skills,
      {
        skill_id: sId,
        name: newSkillName.trim(),
        category: newSkillCategory,
        claimed_level: "Intermediate",
        verified_level: "Unverified",
        verification_status: "pending_verification",
        confidence: "low",
        source_context: "Manually added during profile review",
        source_document: initialProfile.document_name || "Resume"
      }
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter((s) => s.skill_id !== skillId));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        name,
        current_role: currentRole,
        target_role: targetRole,
        education,
        experiences,
        skills,
        projects,
        certifications
      };

      await api.confirmResumeProfile(documentId, payload);
      onConfirmed(payload);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to confirm profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Warning Banner */}
      <div className="rounded-xl border border-[#F2B84B]/30 bg-[#F2B84B]/10 p-5">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="h-6 w-6 text-[#F2B84B] shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-[#F2B84B]">
              Review your extracted profile
            </h4>
            <p className="text-[#B4BDC8] mt-1">
              We identified <strong className="text-[#F5F7FA] font-mono">{skills.length} skills</strong> from your resume. 
              These are resume-based claims and are currently <span className="inline-block rounded px-2 py-0.5 text-xs font-bold uppercase bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/30">Unverified</span>.
              Please review and edit the details below before proceeding to the diagnostic assessment.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-[#E86A6A]/30 bg-[#E86A6A]/10 p-4 text-xs text-[#E86A6A] flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#E86A6A]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Personal Information */}
      <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-6 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-[#27303B] pb-3 mb-4">
          <User className="h-5 w-5 text-[#5B8DEF]" />
          <h3 className="font-semibold text-[#F5F7FA]">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Current Role</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B4BDC8] mb-1 font-medium">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3.5 py-2.5 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none cursor-pointer"
            >
              <option value="data_analyst">Data Analyst (Default Track)</option>
              <option value="business_analyst">Business Analyst</option>
              <option value="data_scientist">Data Scientist</option>
              <option value="ai_ml_engineer">AI / ML Engineer</option>
            </select>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[#B4BDC8] mb-1 font-medium">LinkedIn Profile</label>
              <input
                type="text"
                value={linkedin}
                placeholder="linkedin.com/in/..."
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3 py-2 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#B4BDC8] mb-1 font-medium">GitHub Profile</label>
              <input
                type="text"
                value={github}
                placeholder="github.com/..."
                onChange={(e) => setGithub(e.target.value)}
                className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3 py-2 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#B4BDC8] mb-1 font-medium">Portfolio / Website</label>
              <input
                type="text"
                value={portfolio}
                placeholder="https://..."
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full rounded-lg border border-[#27303B] bg-[#0B0F14] px-3 py-2 text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Skills Grouped by 9 Categories */}
      <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#27303B] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-[#5B8DEF]" />
            <h3 className="font-semibold text-[#F5F7FA]">
              Extracted Skills ({skills.length})
            </h3>
          </div>
          <span className="text-xs text-[#7E8996]">All marked Unverified</span>
        </div>

        {/* Grouped Skills Display */}
        <div className="space-y-4">
          {skillCategories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            if (catSkills.length === 0) return null;

            return (
              <div key={cat} className="rounded-lg border border-[#27303B] bg-[#11161D] p-3.5">
                <h4 className="text-xs font-semibold text-[#5B8DEF] uppercase tracking-wider mb-2">
                  {cat}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map((s) => (
                    <div
                      key={s.skill_id}
                      className="inline-flex items-center space-x-2 rounded-lg border border-[#27303B] bg-[#151B23] px-3 py-1.5 text-xs text-[#F5F7FA] shadow-xs hover:border-[#5B8DEF]/40 transition-colors"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="rounded bg-[#5B8DEF]/15 text-[#5B8DEF] px-1.5 py-0.5 text-[10px] font-mono">
                        {s.claimed_level}
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(s.skill_id)}
                        className="text-[#7E8996] hover:text-[#E86A6A] transition-colors cursor-pointer"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Skill Row */}
        <div className="mt-4 pt-4 border-t border-[#27303B] flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add another skill..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="flex-1 rounded-lg border border-[#27303B] bg-[#0B0F14] px-3 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
          />
          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="rounded-lg border border-[#27303B] bg-[#0B0F14] px-3 py-2 text-xs text-[#B4BDC8] focus:border-[#5B8DEF] focus:outline-none cursor-pointer"
          >
            {skillCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddSkill}
            className="rounded-lg bg-[#5B8DEF] hover:bg-[#719DF5] px-3.5 py-2 text-xs font-semibold text-white transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. Work Experience */}
      <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-6 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-[#27303B] pb-3 mb-4">
          <Briefcase className="h-5 w-5 text-[#36C98F]" />
          <h3 className="font-semibold text-[#F5F7FA]">Work Experience</h3>
        </div>

        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <div key={idx} className="rounded-lg border border-[#27303B] bg-[#11161D] p-4 text-xs">
              <div className="flex items-center justify-between font-medium text-[#F5F7FA] text-sm mb-1">
                <span>{exp.role}</span>
                <span className="text-[#7E8996] text-xs font-normal">
                  {exp.start_date} – {exp.end_date}
                </span>
              </div>
              <div className="text-[#5B8DEF] font-semibold mb-2">{exp.company}</div>
              {exp.responsibilities && (
                <ul className="list-disc list-inside text-[#B4BDC8] space-y-1">
                  {exp.responsibilities.map((r: string, rIdx: number) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Education & Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#27303B] pb-3 mb-3">
            <GraduationCap className="h-4 w-4 text-[#7C6CF2]" />
            <h3 className="font-semibold text-[#F5F7FA] text-sm">Education</h3>
          </div>
          {education.map((edu, idx) => (
            <div key={idx} className="text-xs text-[#B4BDC8]">
              <p className="font-semibold text-[#F5F7FA]">{edu.degree}</p>
              <p className="text-[#7E8996]">{edu.institution} ({edu.start_date} - {edu.end_date})</p>
              {edu.grade && <p className="text-[#36C98F] text-[11px] mt-0.5">{edu.grade}</p>}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#27303B] pb-3 mb-3">
            <FolderGit2 className="h-4 w-4 text-[#5B8DEF]" />
            <h3 className="font-semibold text-[#F5F7FA] text-sm">Projects & Portfolio</h3>
          </div>
          {projects.length > 0 ? (
            projects.map((proj, idx) => (
              <div key={idx} className="text-xs text-[#B4BDC8] mb-2">
                <p className="font-semibold text-[#F5F7FA]">{proj.name}</p>
                <p className="text-[#7E8996] line-clamp-2">{proj.description}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#7E8996]">No project links detected in document.</p>
          )}
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#27303B]">
        {onCancel ? (
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#27303B] bg-[#11161D] px-5 py-2.5 text-xs font-semibold text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#1A212B] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        ) : <div />}

        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="rounded-lg bg-[#5B8DEF] hover:bg-[#719DF5] active:bg-[#4779D8] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Confirming Profile & Claims...</span>
          ) : (
            <>
              <span>Confirm Profile & Continue to Diagnostic</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
