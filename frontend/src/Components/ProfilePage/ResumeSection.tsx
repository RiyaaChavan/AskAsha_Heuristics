"use client"

import type React from "react"
import { useState } from "react"
import { FileText, Calendar, Upload, X, Check } from "lucide-react"
import "./ResumeSection.css"

interface ResumeSectionProps {
  resumeFile: string;
  resumeUpdated: string;
}

export default function ResumeSection({ resumeFile, resumeUpdated }: ResumeSectionProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewFile(file)
    }
  }

  const handleViewResume = () => {
    // In a real app, this would open the actual file
    // For demo purposes, we'll just open a new window
    window.open(`/resume-preview?file=${resumeFile}`, "_blank")
  }

  const handleUpdateClick = () => {
    setIsUpdating(true)
  }

  const handleCancelUpdate = () => {
    setIsUpdating(false)
    setNewFile(null)
  }

  const handleSaveChanges = () => {
    // In a real app, this would upload the file to the server
    // For demo purposes, we'll just show a success message
    if (newFile) {
      setUploadSuccess(true)
      setTimeout(() => {
        setUploadSuccess(false)
        setIsUpdating(false)
        setNewFile(null)
      }, 2000)
    }
  }

  return (
    <div className="resume-container">
      <div className="resume-header">
        <div className="resume-title-container">
          <div className="resume-title-icon">
            <FileText className="icon-medium" />
          </div>
          <h2 className="resume-title">Resume</h2>
        </div>

        <div className="resume-updated-badge">
          <Calendar className="resume-calendar-icon" />
          <span>Updated: {resumeUpdated}</span>
        </div>
      </div>

      <div className="resume-divider"></div>

      {!isUpdating ? (
        <div className="resume-view-mode">
          <div className="resume-preview-box">
            <div className="resume-preview-content">
              <div className="resume-preview-icon-container">
                <FileText className="resume-preview-icon" />
              </div>
              <h3 className="resume-preview-title">Resume preview</h3>
              <p className="resume-filename">{resumeFile}</p>
            </div>
          </div>

          <div className="resume-actions">
            <button
              onClick={handleViewResume}
              className="resume-view-button"
            >
              View Resume
            </button>

            <button
              onClick={handleUpdateClick}
              className="resume-update-button"
            >
              Update Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="resume-edit-mode">
          <div className="resume-upload-container">
            {newFile ? (
              <div className="file-selected-container">
                <div className="file-selected-icon-container">
                  <FileText className="file-selected-icon" />
                </div>
                <h3 className="file-selected-title">File selected</h3>
                <p className="file-selected-name">{newFile.name}</p>
                <button
                  onClick={() => setNewFile(null)}
                  className="file-remove-button"
                >
                  <X className="file-remove-icon" />
                  Remove
                </button>
              </div>
            ) : (
              <div className="upload-prompt-container">
                <div className="upload-icon-container">
                  <Upload className="upload-icon" />
                </div>
                <h3 className="upload-title">Upload new resume</h3>
                <p className="upload-instructions">Drag and drop or click to browse</p>
                <input
                  type="file"
                  id="resume-upload"
                  className="file-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="resume-upload"
                  className="browse-button"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>

          <div className="edit-actions">
            <button
              onClick={handleCancelUpdate}
              className="cancel-button"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={!newFile || uploadSuccess}
              className={`save-button ${!newFile || uploadSuccess ? "save-button-disabled" : ""}`}
            >
              {uploadSuccess ? (
                <>
                  <Check className="save-success-icon" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}