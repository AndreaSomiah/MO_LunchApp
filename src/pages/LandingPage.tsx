import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import CreateAccountForm from '@/components/auth/CreateAccountForm';
import { RraLogo } from '@/components/RraLogo';

const stats = [
  { label: 'Lunches served',   value: '12,400+' },
  { label: 'Partner kitchens', value: '8'       },
  { label: 'Average rating',   value: '4.8 ★'   },
  { label: 'On-time delivery', value: '99.2%'   },
];

const LandingPage = (): JSX.Element => (
  <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <aside className="relative hidden flex-col justify-between bg-[#082B63] p-12 text-white lg:flex">
      <div>
        <RraLogo variant="compactReversed" size="xl" />
        <p className="mt-4 max-w-md text-lg text-white/80">
          Lunch, sorted. Browse, order, and pick up — without the daily group chat.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-white/70">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs uppercase tracking-[0.2em] text-white/60">
        Part of the MagicOrange ecosystem
      </p>
    </aside>

    <main className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center lg:hidden">
          <RraLogo variant="compact" size="lg" />
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <CreateAccountForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
);

export default LandingPage;
