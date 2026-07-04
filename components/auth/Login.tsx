import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import imageLogo from "figma:asset/53408374755378de61555740ced8514efca8131d.png";
import imageIllustration from "figma:asset/a666fb73cddb264ec8bd2eac853907cb404e355e.png";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { API } from "../../config"; // <- sesuaikan path config.tsx kamu

interface LoginProps {
  onSwitchToSignUp?: () => void;
}

type AuthNrpRequest = {
  action: number;
  nrp: string;
  otp: string;
};

type AuthNrpResponse = {
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

async function authenticateNrp(nrp: string): Promise<AuthNrpResponse> {
  const payload: AuthNrpRequest = { action: 1, nrp, otp: "" };

  const res = await fetch(API.AuthenticationNRP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  // kalau API kamu kadang balikin non-JSON saat error:
  const text = await res.text();
  let json: AuthNrpResponse | null = null;
  try {
    json = text ? (JSON.parse(text) as AuthNrpResponse) : null;
  } catch {
    // ignore parse fail
  }

  if (!res.ok) {
    // HTTP error (misal 400/500)
    const msg = json?.message || `HTTP ${res.status} - ${res.statusText}`;
    throw new Error(msg);
  }

  if (!json) throw new Error("Response API tidak valid (bukan JSON).");
  return json;
}

export function Login({ onSwitchToSignUp }: LoginProps) {
  const navigate = useNavigate();

  const [nrp, setNrp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanedNrp = nrp.trim();
  const canSubmit = cleanedNrp.length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const value = cleanedNrp;
    if (!value) return;

    try {
      setIsSubmitting(true);

      const result = await authenticateNrp(value);

      if (result.responseCode === 200) {
        // sukses -> ke OTP, bawa NRP di querystring
        navigate(`/auth/otp?nrp=${encodeURIComponent(value)}`);
        return;
      }

      // gagal (responseCode selain 200)
      setErrorMsg(result.message || "Gagal mengirim OTP. Silakan coba lagi.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Gagal mengirim OTP. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    Login For Approval
                  </h1>
                  <p className="text-gray-600">Masukkan NRP untuk menerima OTP</p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NRP */}
                <div className="space-y-2" style={{ marginBottom: "1em" }}>
                  <Label htmlFor="nrp" className="text-sm text-gray-700">
                    NRP
                  </Label>
                  <Input
                    id="nrp"
                    name="nrp"
                    inputMode="numeric"
                    placeholder="Contoh: 241200"
                    value={nrp}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                      setNrp(onlyDigits);
                    }}
                    className="h-12 bg-gray-50 border-gray-300 focus:border-[#015952] focus:ring-[#015952]"
                    required
                  />
                </div>

                {/* Error */}
                {errorMsg ? (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 mb-3 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                ) : null}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-12 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: "#4077ceff" }}
                >
                  {isSubmitting ? "Mengirim OTP..." : "Kirim OTP"}
                </Button>

                {/* Optional */}
                {onSwitchToSignUp ? (
                  <div className="text-center text-sm text-gray-600" style={{ marginTop: "1em" }}>
                    Need access?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToSignUp}
                      className="hover:underline"
                      style={{ color: "#007B5F" }}
                    >
                      Contact your administrator
                    </button>
                  </div>
                ) : null}
              </form>

              <footer className="mt-8">
                <p className="text-center text-xs text-gray-400">
                  © 2025 AlamTri. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
