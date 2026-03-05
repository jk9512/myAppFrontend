import { useState } from "react";
import PageWrapper from "../components/common/PageWrapper";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import api from "../api/axios";
import styles from "./WhatsAppNotification.module.css";
import { MessageCircle } from "lucide-react";

export default function WhatsAppNotification() {
    const [to, setTo] = useState("");
    const [dateVar, setDateVar] = useState("12/1");
    const [timeVar, setTimeVar] = useState("3pm");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!to) {
            showToast("Please enter a valid phone number", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post("/notifications/whatsapp", {
                to,
                variables: {
                    "1": dateVar,
                    "2": timeVar
                }
            });
            showToast("WhatsApp message sent successfully!");
            setTo("");
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to send message", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="WhatsApp Notifications">
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Send WhatsApp Message</h2>
                    <div className={styles.infoBox}>
                        <MessageCircle size={20} className={styles.infoIcon} />
                        <p>This will send an approved Twilio WhatsApp template message to the recipient.</p>
                    </div>

                    <form onSubmit={handleSend} className={styles.form}>
                        <div className={styles.formGroup}>
                            <Input
                                id="wa-to"
                                label="Recipient Phone Number"
                                placeholder="+919512746758"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                required
                            />
                            <small className={styles.helpText}>Include country code (e.g. +91)</small>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <Input
                                    id="wa-date"
                                    label="Date Variable (1)"
                                    placeholder="12/1"
                                    value={dateVar}
                                    onChange={(e) => setDateVar(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <Input
                                    id="wa-time"
                                    label="Time Variable (2)"
                                    placeholder="3pm"
                                    value={timeVar}
                                    onChange={(e) => setTimeVar(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.previewBox}>
                            <h4>Template Preview</h4>
                            <p className={styles.previewText}>
                                Your appointment is coming up on <strong>{dateVar}</strong> at <strong>{timeVar}</strong>
                                <br /><span className={styles.muted}>(Note: actual template text depends on Twilio SID HXb5b62575e6e4ff6129ad7c8efe1f983e)</span>
                            </p>
                        </div>

                        <div className={styles.actions}>
                            <Button type="submit" loading={loading} style={{ width: "100%" }}>
                                Send Message <MessageCircle size={16} style={{ marginLeft: "8px" }} />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
}
