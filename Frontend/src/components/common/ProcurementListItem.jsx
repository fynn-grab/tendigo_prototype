// src/components/common/ProcurementListItem.jsx
import React, { useState } from "react";
import styles from "./ProcurementListItem.module.css";
import commonStyles from "./Common.module.css";
import {
  FileText,
  Building2,
  CalendarDays,
  MapPin,
  MessageSquareText,
  ExternalLink,
  PlayCircle,
  StopCircle,
  ClipboardList,
  Heart,
} from "lucide-react";

const ProcurementListItem = ({
  procurement,
  onAskChatbot,
  onShowDetails,
  onLike,
  isLiked,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.listItem}>
      <div className={styles.icon}>
        <FileText size={28} />
      </div>
      <div className={styles.details}>
        <h3 className={styles.title}>{procurement.title}</h3>

        <div className={styles.authorityInfo}>
          {procurement.city && (
            <div className={styles.metaItem}>
              <MapPin size={14} />
              <span>{procurement.city}</span>
            </div>
          )}
          {procurement.authorityName && (
            <div className={styles.metaItem}>
              <Building2 size={14} />
              <span>{procurement.authorityName}</span>
            </div>
          )}
        </div>

        <div>
          <p
            className={`${styles.description} ${
              isExpanded ? styles.expanded : ""
            }`}
          >
            {procurement.description}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.toggleDescription}
          >
            {isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
          </button>
        </div>

        <div className={styles.dateInfo}>
          {procurement.publicationDate && (
            <div className={styles.dateItem} title="Publication Date">
              <CalendarDays size={14} /> <span>Published:</span>{" "}
              {procurement.publicationDate}
            </div>
          )}
          {procurement.startDate && (
            <div className={styles.dateItem} title="Submission Start Date">
              <PlayCircle size={14} /> <span>Start:</span>{" "}
              {procurement.startDate}
            </div>
          )}
          {procurement.endDate && (
            <div className={styles.dateItem} title="Submission End Date">
              <StopCircle size={14} /> <span>End:</span> {procurement.endDate}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${commonStyles.buttonPrimary} ${styles.actionButton}`}
            onClick={() => onShowDetails(procurement)}
            title="Show document details"
          >
            <ClipboardList size={16} />
            <span>Zusammenfassung</span>
          </button>
          <button
            className={`${commonStyles.buttonSecondary} ${styles.actionButton}`}
            onClick={() => onAskChatbot(procurement)}
            title="Ask questions about the document"
          >
            <MessageSquareText size={16} />
            <span>AI Assistant fragen</span>
          </button>
          {procurement.original_url && (
            <a
              href={procurement.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${commonStyles.buttonSecondary} ${styles.actionButton}`}
            >
              <ExternalLink size={16} />
              <span>Zur Quelle</span>
            </a>
          )}
          <button
            className={`${commonStyles.buttonSecondary} ${
              styles.actionButton
            } ${styles.likeButton} ${isLiked ? styles.liked : ""}`}
            onClick={() => onLike(procurement)}
            title={isLiked ? "Gemerkt" : "Merken"}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            <span>{isLiked ? "Gemerkt" : "Merken"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementListItem;
