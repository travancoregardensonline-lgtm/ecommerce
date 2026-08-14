import re

with open("/Users/apple/Desktop/sunrise-gardens/travancore-gardens/src/app/(store)/checkout/page.tsx", "r") as f:
    code = f.read()

# Add imports
imports_to_add = """import { authActions, ensureProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";"""

code = code.replace('import { createClient } from "@/lib/supabase/client";', 
                    'import { createClient } from "@/lib/supabase/client";\n' + imports_to_add)

# Add states for OTP
otp_states = """
    // OTP / Auth states for guests
    const [authStep, setAuthStep] = useState<"details" | "otp">("details");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
"""
code = code.replace('const [orderError, setOrderError] = useState<string | null>(null);',
                    'const [orderError, setOrderError] = useState<string | null>(null);\n' + otp_states)

# Add Handlers for OTP
otp_handlers = """
    const handleSendOTP = async () => {
        if (!form.phone || form.phone.length !== 10) {
            setAuthError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setAuthLoading(true);
        setAuthError(null);
        const result = await authActions.sendPhoneOTP(form.phone);
        setAuthLoading(false);
        if (result.error) {
            setAuthError(result.error.message ?? "Failed to send OTP.");
            return;
        }
        setAuthStep("otp");
    };

    const handleVerifyOTP = async () => {
        const token = otp.join("");
        if (token.length !== 6) {
            setAuthError("Please enter all 6 digits.");
            return;
        }
        setAuthLoading(true);
        setAuthError(null);
        const result = await authActions.verifyPhoneOTP(form.phone, token);
        setAuthLoading(false);
        if (result.error) {
            setAuthError("Invalid or expired OTP.");
            return;
        }
        
        const currentUser = await authActions.getCurrentUser();
        if (currentUser) {
            await ensureProfile(currentUser.id, form.phone, form.full_name);
            setAuthStep("details");
            toast.success("Successfully logged in!");
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) {
            document.getElementById(`checkout-otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`checkout-otp-${index - 1}`)?.focus();
        }
    };
"""

code = code.replace('const handleApplyCoupon = async () => {', otp_handlers + '\n    const handleApplyCoupon = async () => {')


# In handlePlaceOrder, remove the redirect
code = code.replace('if (!user) { router.push("/login"); return; }', 
                    'if (!user) { toast.error("Please verify your phone number to continue."); return; }')


# Update the UI
contact_section_original = """                        <section className="bg-card border border-border/50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">Contact Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={form.full_name || profile?.name || ""}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="Your full name" required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={user?.email ?? ""} readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Phone</Label>
                                    <Input
                                        type="tel"
                                        value={form.phone || profile?.phone || ""}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+91 98765 43210" required
                                    />
                                </div>
                            </div>
                        </section>"""


contact_section_new = """                        <section className="bg-card border border-border/50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">{!user ? "Sign In to Checkout" : "Contact Information"}</h2>
                            </div>
                            
                            {!user ? (
                                <div className="space-y-6">
                                    {authError && (
                                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                                            {authError}
                                        </div>
                                    )}
                                    {authStep === "details" ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Mobile Number</Label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-4 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-medium border-input">
                                                            +91
                                                        </span>
                                                        <Input
                                                            type="tel"
                                                            value={form.phone}
                                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                                            placeholder="98765 43210"
                                                            className="rounded-l-none"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Full Name (if new)</Label>
                                                    <Input
                                                        value={form.full_name}
                                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                            </div>
                                            <Button type="button" onClick={handleSendOTP} disabled={authLoading || form.phone.length !== 10} className="w-full">
                                                {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Verify Phone to Continue
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-center block">Enter 6-Digit OTP</Label>
                                                <div className="flex gap-2 justify-center">
                                                    {otp.map((digit, i) => (
                                                        <input
                                                            key={i}
                                                            id={`checkout-otp-${i}`}
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                            className={cn(
                                                                "h-12 w-10 sm:w-12 text-center text-xl font-bold border rounded-lg bg-background",
                                                                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                                digit ? "border-primary" : "border-input"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-center text-muted-foreground">Sent to +91 {form.phone}</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <Button type="button" onClick={handleVerifyOTP} disabled={authLoading} className="w-full">
                                                    {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Verify & Continue
                                                </Button>
                                                <button type="button" onClick={() => {setAuthStep("details"); setOtp(["","","","","",""]);}} className="text-sm text-muted-foreground hover:text-foreground">
                                                    Change phone number
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={form.full_name || profile?.name || ""}
                                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                            placeholder="Your full name" required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={user?.email ?? ""} readOnly className="bg-muted" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Phone</Label>
                                        <Input
                                            type="tel"
                                            value={form.phone || profile?.phone || ""}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+91 98765 43210" required
                                        />
                                    </div>
                                </div>
                            )}
                        </section>"""

code = code.replace(contact_section_original, contact_section_new)


# Hide shipping and payment if !user
address_section = '                        {/* Saved Addresses or New */}'
code = code.replace(address_section, '                        {/* Saved Addresses or New */}\n                        {user && (')

payment_section = '                        </section>' # this is the end of payment section
# wait, replacing by `</section>` is too risky.
# Let's use regex
code = re.sub(
    r'(<section className="bg-card border border-border/50 rounded-xl p-6">\s*<div className="flex items-center gap-3 mb-6">\s*<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">\s*<CreditCard.*?)(</section>)',
    r'\1\2\n                        )}',
    code,
    flags=re.DOTALL
)

# And if !user, we disable or hide the "Place Order" button.
# "Place Order" button is: `<Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isPlacing}>`
place_order_btn = '<Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isPlacing}>'
code = code.replace(place_order_btn, '<Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={!user || isPlacing}>')

# Place order text
place_order_text = '{isPlacing ? "Processing..." : "Place Order"}'
code = code.replace(place_order_text, '{!user ? "Sign In to Place Order" : isPlacing ? "Processing..." : "Place Order"}')


with open("/Users/apple/Desktop/sunrise-gardens/travancore-gardens/src/app/(store)/checkout/page.tsx", "w") as f:
    f.write(code)

print("done")
