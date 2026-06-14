import ReCAPTCHA from "react-google-recaptcha";

type RecaptchaProps = {
  onVerify?: (token: string | null) => void;
};

const Recaptcha = ({ onVerify }: RecaptchaProps) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ??
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google test site key

  return (
    <div className="acc-recaptcha">
      <ReCAPTCHA sitekey={siteKey} onChange={(token) => onVerify?.(token)} />
    </div>
  );
};

export default Recaptcha;