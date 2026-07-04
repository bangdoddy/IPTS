// OTP.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import imageLogo from "figma:asset/53408374755378de61555740ced8514efca8131d.png";
import imageIllustration from "figma:asset/a666fb73cddb264ec8bd2eac853907cb404e355e.png";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";

import { API } from "../../config"; // sesuaikan path kamu
import { authSet, type AuthUser } from "../../libs/auth"; // sesuaikan path kamu

interface OTPProps {
  redirectTo?: string; // default "/dashboard"
}

type OtpArray = [string, string, string, string, string, string];

type AuthOtpRequest = { action: number; nrp: string; otp: string };
type AuthOtpResponse = {
  responseCode: number;
  message: string;
  data?: {
    nrp: string;
    nama: string;
    email: string;
    jobsite: string;
    otp: string;
    actortype: string;
  };
};

const OTP_LENGTH = 6;
const LOGIN_PATH = "/";
const EMPTY_OTP: OtpArray = ["", "", "", "", "", ""];

const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");

async function postJson<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch { }

  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status} - ${res.statusText}`);
  }
  if (!json) throw new Error("Response API tidak valid (bukan JSON).");
  return json as TRes;
}

function EdgeBlur() {
  const top = useMemo(
    () => ({
      background:
        "linear-gradient(to bottom, rgba(232, 245, 243, 0.95), transparent)",
      backdropFilter: "blur(20px)",
    }),
    []
  );
  const bottom = useMemo(
    () => ({
      background:
        "linear-gradient(to top, rgba(249, 230, 216, 0.95), transparent)",
      backdropFilter: "blur(20px)",
    }),
    []
  );
  const left = useMemo(
    () => ({
      background:
        "linear-gradient(to right, rgba(232, 245, 243, 0.95), transparent)",
      backdropFilter: "blur(20px)",
    }),
    []
  );
  const right = useMemo(
    () => ({
      background:
        "linear-gradient(to left, rgba(249, 230, 216, 0.95), transparent)",
      backdropFilter: "blur(20px)",
    }),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute top-0 left-0 right-0 h-32" style={top} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={bottom} />
      <div className="absolute top-0 bottom-0 left-0 w-32" style={left} />
      <div className="absolute top-0 bottom-0 right-0 w-32" style={right} />
    </div>
  );
}

export function OTP({ redirectTo = "/home" }: OTPProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nrp = (params.get("nrp") ?? "").trim();

  const [digits, setDigits] = useState<OtpArray>(EMPTY_OTP);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const otp = digits.join("");
  const canSubmit = otp.length === OTP_LENGTH && !isSubmitting;

  const resetMessages = () => {
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const focusIndex = (idx: number) => {
    const el = refs.current[idx];
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus();
      el.select?.();
    });
  };

  const setDigitAt = (idx: number, val: string) => {
    setDigits((prev) => {
      const next = [...prev] as OtpArray;
      next[idx] = val;
      return next;
    });
  };

  const fillFromString = (raw: string) => {
    const cleaned = onlyDigits(raw).slice(0, OTP_LENGTH);
    if (!cleaned) return;

    const arr = cleaned.split("");
    setDigits(() => {
      const next = [...EMPTY_OTP] as OtpArray;
      for (let i = 0; i < OTP_LENGTH; i++) next[i] = arr[i] ?? "";
      return next;
    });

    focusIndex(Math.min(cleaned.length, OTP_LENGTH) - 1);
  };

  useEffect(() => {
    if (!nrp) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }
    focusIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nrp]);

  const handleChange = (idx: number, value: string) => {
    resetMessages();
    const cleaned = onlyDigits(value);

    if (cleaned.length > 1) {
      fillFromString(cleaned);
      return;
    }

    setDigitAt(idx, cleaned);

    if (cleaned && idx < OTP_LENGTH - 1) {
      focusIndex(idx + 1);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (digits[idx]) {
        setDigitAt(idx, "");
        return;
      }
      if (idx > 0) {
        setDigitAt(idx - 1, "");
        focusIndex(idx - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusIndex(idx - 1);
      return;
    }

    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(idx + 1);
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData("text");
    const cleaned = onlyDigits(text).slice(0, OTP_LENGTH);
    if (!cleaned) return;

    e.preventDefault();
    resetMessages();
    fillFromString(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    if (otp.length !== OTP_LENGTH) return;

    try {
      setIsSubmitting(true);

      const body: AuthOtpRequest = { action: 2, nrp, otp }; // sesuaikan action jika perlu
      const result = await postJson<AuthOtpRequest, AuthOtpResponse>(
        API.AuthenticationOTP,
        body
      );
      console.log(result.data);
      if (result.responseCode !== 200 || !result.data) {
        setErrorMsg(result.message || "OTP tidak valid / sudah expired. Silakan coba lagi.");
        return;
      }

      const user: AuthUser = {
        nrp: result.data.nrp,
        nama: result.data.nama,
        email: result.data.email,
        jobsite: result.data.jobsite,
        actortype: result.data.actortype,
      };

      // ✅ simpan ke cookie
      authSet(user);

      // ✅ redirect ke dashboard
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message ?? "OTP tidak valid / sudah expired. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    resetMessages();

    try {
      setIsResending(true);

      // kalau resend kamu pakai endpoint lain, ganti di sini.
      // kalau backend resend pakai NRPAuthenticate action tertentu, sesuaikan.
      // sementara: panggil OTPAuthenticate dengan otp kosong TIDAK disarankan, tapi aku biarin placeholder.
      // Kamu bisa kasih endpoint resend nanti.
      setInfoMsg("Fitur resend belum dihubungkan ke API (endpoint resend belum ditentukan).");

      setDigits(EMPTY_OTP);
      focusIndex(0);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Gagal kirim ulang OTP. Silakan coba lagi.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeNrp = () => navigate(LOGIN_PATH, { replace: true });

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        background:
          "linear-gradient(225deg, rgb(232, 245, 243) 0%, rgb(83 35 177) 50%, rgb(58 73 255) 100%)",
      }}
    >
      <EdgeBlur />

      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-card bg-white shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex flex-row md:flex-row">
          {/* LEFT */}
          <div className="md:w-1/2 p-8 sm:p-12 flex w-full flex-col justify-center">
            <div className="mb-8">
              <img src={imageLogo} alt="AlamTri" className="h-16 w-auto" />
            </div>

            <div className="mb-8 w-full max-w-xs">
              <ImageWithFallback
                src={imageIllustration}
                alt="Improvement illustration"
                className="w-full h-auto rounded-2xl"
              />
            </div>

            <div className="text-left">
              <h2 className="text-2xl mb-2" style={{ color: "#015952" }}>
                Turning Ideas Into Impact
              </h2>
              <p className="text-sm text-gray-600">
                Integrated hub for innovation and improvement management
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:w-1/2 p-8 sm:p-12 flex w-full flex-col justify-center bg-white">
            <div className="w-full max-w-md mx-auto">
              <header className="mb-8">
                <div className="mb-10">
                  <h1 className="mb-2" style={{ color: "#014357" }}>
                    Verify OTP
                  </h1>
                  <p className="text-gray-600">
                    Masukkan 6 digit OTP yang dikirim ke akun NRP{" "}
                    <span className="font-semibold text-gray-700">{nrp}</span>
                  </p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2" style={{ marginBottom: "1em" }}>
                  <Label className="text-sm text-gray-700">OTP (6 digit)</Label>

                  <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                    {digits.map((d, idx) => (
                      <Input
                        key={idx}
                        ref={(el) => (refs.current[idx] = el)}
                        inputMode="numeric"
                        value={d}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        maxLength={1}
                        autoComplete={idx === 0 ? "one-time-code" : "off"}
                        className="h-12 w-12 sm:w-14 text-center text-lg bg-gray-50 border-gray-300 focus:border-[#015952] focus:ring-[#015952]"
                        aria-label={`OTP digit ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleChangeNrp}
                      className="text-sm hover:underline"
                      style={{ color: "#007B5F" }}
                    >
                      Ubah NRP
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-sm hover:underline disabled:opacity-60"
                      style={{ color: "#007B5F" }}
                    >
                      {isResending ? "Mengirim ulang..." : "Kirim ulang OTP"}
                    </button>
                  </div>
                </div>

                {infoMsg ? (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                    {infoMsg}
                  </div>
                ) : null}

                {errorMsg ? (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-12 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: "#4077ceff" }}
                >
                  {isSubmitting ? "Memverifikasi..." : "Verify"}
                </Button>

                <footer className="mt-8">
                  <p className="text-center text-xs text-gray-400">
                    © 2025 AlamTri. All rights reserved.
                  </p>
                </footer>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
