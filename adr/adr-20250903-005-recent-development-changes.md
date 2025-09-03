# ADR-20250903-005: Recent Development Changes

**Status:** Accepted  
**Date:** 2025-09-03  
**Authors:** claude-code agent  

## Context

Recent development activity detected:

Commits:
fa94fac6e2 feat: complete Phase 3 GROUP G - SOP foundation infrastructure
8455a3ecd7 feat: complete Phase 2 - comprehensive SOP dashboard implementation
1df22db028 feat: complete Phase 2 GROUP E - navigation and branding systems
8c9578b763 Merge pull request #9043 from activepieces/feat/release0.68.3
6b25347146 feat: release 0.68.3
fce2633847 Merge pull request #9042 from activepieces/fix/locks
09432f009a fix: increase lock timeout in case user interaction jobs is busy
95ca7b5aec Merge branch 'main' of https://github.com/activepieces/activepieces
255f7504bf feat: implement soft delete in trigger source service
07395c6388 Merge pull request #9041 from activepieces/l10n_main
f54489af94 chore: auto bump translated pieces
337709fa6d New translations translation.json (Portuguese, Brazilian)
4ccc62303f New translations translation.json (Portuguese, Brazilian)
b357bab91b New translations translation.json (Chinese Traditional)
43ada3bf5a New translations translation.json (Chinese Simplified)
5bd27503f2 New translations translation.json (Chinese Traditional)
d36467372d New translations translation.json (Chinese Traditional)
6f4363e99a New translations translation.json (Chinese Traditional)
bb35e415ed New translations translation.json (Chinese Traditional)
b02281ef10 New translations translation.json (Chinese Simplified)
a7b7fb3617 New translations translation.json (Chinese Simplified)
26d620eb2b New translations translation.json (Chinese Simplified)
10cf6d8633 New translations translation.json (Chinese Simplified)
ebe87eb5ff New translations translation.json (Chinese Traditional)
3abfbbf0ce New translations translation.json (Chinese Simplified)
95f0345dba New translations translation.json (Dutch)
b1413a00dd New translations translation.json (Dutch)
0bd37c990b New translations translation.json (Japanese)
64a76281c4 New translations translation.json (Japanese)
e60e46e755 New translations translation.json (German)
ae62bf4b9d New translations translation.json (German)
c1b63f3b5c New translations translation.json (Spanish)
14cc321d67 New translations translation.json (Spanish)
4d92e6029c New translations translation.json (French)
39137408b9 New translations translation.json (French)
a095bcbb78 New translations translation.json (Chinese Traditional)
9dfc9dc9e4 New translations translation.json (Chinese Simplified)
e63fe28c1c New translations translation.json (Chinese Traditional)
6d039353d3 New translations translation.json (Chinese Traditional)
43bb49394f New translations translation.json (Chinese Traditional)
bcd0a1a349 New translations translation.json (Chinese Simplified)
aa1e4a9048 New translations translation.json (Chinese Simplified)
5673106418 New translations translation.json (Chinese Simplified)
af3dcca295 New translations translation.json (Chinese Traditional)
d9918e8337 New translations translation.json (Chinese Simplified)
5d7ad233b0 New translations translation.json (Chinese Traditional)
6ac91750c6 New translations translation.json (Chinese Simplified)
819670337a New translations translation.json (Chinese Traditional)
588a7f4c15 New translations translation.json (Chinese Simplified)
554b9d6d9d New translations translation.json (Chinese Traditional)
68eb7bbcea New translations translation.json (Chinese Simplified)
7eaea523df New translations translation.json (Chinese Traditional)
0fc1ce9375 New translations translation.json (Chinese Simplified)
fca7ad1bfe New translations translation.json (Chinese Traditional)
37590f7147 New translations translation.json (Chinese Simplified)
34d733e37e New translations translation.json (Chinese Traditional)
b860e98799 New translations translation.json (Chinese Traditional)
9c87b24e20 New translations translation.json (Chinese Traditional)
de7ed850e8 New translations translation.json (Chinese Simplified)
d4a2aa1f84 New translations translation.json (Chinese Simplified)
89c2eef843 New translations translation.json (Chinese Simplified)
c7bc37f18a New translations translation.json (Chinese Traditional)
3a951a5ded New translations translation.json (Chinese Traditional)
2979d1a075 New translations translation.json (Chinese Traditional)
744a3eb2a0 New translations translation.json (Chinese Traditional)
0faa542a24 New translations translation.json (Chinese Traditional)
dcaea4911f New translations translation.json (Chinese Traditional)
29756fce79 New translations translation.json (Chinese Simplified)
304f374359 New translations translation.json (Chinese Simplified)
16655c5bc4 New translations translation.json (Chinese Simplified)
0d12443402 New translations translation.json (Chinese Simplified)
5ec6731dd0 New translations translation.json (Chinese Simplified)
90d0c6f9db New translations translation.json (Chinese Simplified)
8f50398960 New translations translation.json (Chinese Traditional)
3277a2e875 New translations translation.json (Chinese Traditional)
d05624f346 New translations translation.json (Chinese Traditional)
4f0164633a New translations translation.json (Chinese Traditional)
1280a8a263 New translations translation.json (Chinese Traditional)
5ff0180680 New translations translation.json (Chinese Traditional)
35215e9947 New translations translation.json (Chinese Simplified)
00920246c3 New translations translation.json (Chinese Simplified)
9c5949ec6c New translations translation.json (Chinese Simplified)
373300a79d New translations translation.json (Chinese Simplified)
0631e5977b New translations translation.json (Chinese Simplified)
c612c61f1c New translations translation.json (Chinese Simplified)
bb8d2f0973 New translations translation.json (Chinese Traditional)
1fa2202895 New translations translation.json (Chinese Traditional)
919b8f60b1 New translations translation.json (Chinese Traditional)
483cf4a091 New translations translation.json (Chinese Traditional)
5ff42f595b New translations translation.json (Chinese Traditional)
935aa03f77 New translations translation.json (Chinese Traditional)
7b483e2496 New translations translation.json (Chinese Simplified)
8dbd6a9572 New translations translation.json (Chinese Simplified)
f6f8a6fbff New translations translation.json (Chinese Simplified)
fee70f4f46 New translations translation.json (Chinese Simplified)
98640b6117 New translations translation.json (Chinese Simplified)
d230ff8c52 New translations translation.json (Chinese Traditional)
1abbbee767 New translations translation.json (Chinese Traditional)
2953915f9c New translations translation.json (Chinese Traditional)
d9a3224bd8 New translations translation.json (Chinese Traditional)
4eb8b18d78 New translations translation.json (Chinese Traditional)
1ef3c7e2df New translations translation.json (Chinese Traditional)
bc47df1e14 New translations translation.json (Chinese Simplified)
813f4c23d2 New translations translation.json (Chinese Simplified)
8aebd0ef3d New translations translation.json (Chinese Simplified)
13fba4cfd0 New translations translation.json (Chinese Simplified)
079e58bbf5 New translations translation.json (Chinese Simplified)
2049697ff4 New translations translation.json (Chinese Simplified)
3558f16f9a New translations translation.json (Chinese Simplified)
1a54202dd0 New translations translation.json (Chinese Traditional)
1e4ed8b604 New translations translation.json (Chinese Traditional)
5fc38f4d39 New translations translation.json (Chinese Traditional)
38f40670f0 New translations translation.json (Chinese Traditional)
2fc8e42295 New translations translation.json (Chinese Traditional)
eed6db25ed New translations translation.json (Chinese Traditional)
3c6c8b0f31 New translations translation.json (Chinese Simplified)
488ae25c3e New translations translation.json (Chinese Simplified)
4a8636bdf6 New translations translation.json (Chinese Simplified)
29dd52b1ad New translations translation.json (Chinese Simplified)
e6e3b12c74 New translations translation.json (Chinese Simplified)
de5d97b2a5 New translations translation.json (Chinese Simplified)
38675f3df8 New translations translation.json (Chinese Traditional)
6083915947 New translations translation.json (Chinese Traditional)
0b8bc9f3aa New translations translation.json (Chinese Traditional)
036d6b6170 New translations translation.json (Chinese Traditional)
e428e63da3 New translations translation.json (Chinese Traditional)
662130e4ce New translations translation.json (Chinese Traditional)
fe7766c362 New translations translation.json (Chinese Simplified)
72998426d6 New translations translation.json (Chinese Simplified)
84a890af39 New translations translation.json (Chinese Simplified)
8d565193c1 New translations translation.json (Chinese Simplified)
d2bea2ef37 New translations translation.json (Chinese Simplified)
f6b9cc94e0 New translations translation.json (Chinese Simplified)
fba129b13c New translations translation.json (Chinese Traditional)
3dad816427 New translations translation.json (Chinese Traditional)
cc480e551e New translations translation.json (Chinese Traditional)
2eadb532e2 New translations translation.json (Chinese Traditional)
019a7588f6 New translations translation.json (Chinese Traditional)
60ee68d420 New translations translation.json (Chinese Traditional)
9cefd7a2df New translations translation.json (Chinese Traditional)
c3c7b2a597 New translations translation.json (Chinese Simplified)
5657c47037 New translations translation.json (Chinese Simplified)
a36c77d9a3 New translations translation.json (Chinese Simplified)
76df5771f4 New translations translation.json (Chinese Simplified)
721af92a0d New translations translation.json (Chinese Simplified)
f20d801fb1 New translations translation.json (Chinese Simplified)
bfb4e80810 New translations translation.json (Chinese Traditional)
957a8798c7 New translations translation.json (Chinese Traditional)
d7a92fee94 New translations translation.json (Chinese Traditional)
500e4ff4e9 New translations translation.json (Chinese Traditional)
9f96dcd861 New translations translation.json (Chinese Traditional)
d390899d2d New translations translation.json (Chinese Traditional)
c88c63a00e New translations translation.json (Chinese Simplified)
4909bbfd80 New translations translation.json (Chinese Simplified)
0e570760ac New translations translation.json (Chinese Simplified)
684ed4e97a New translations translation.json (Chinese Simplified)
8aaaa24d55 New translations translation.json (Chinese Simplified)
77c90b8dbe New translations translation.json (Chinese Simplified)
4717637817 New translations translation.json (Chinese Simplified)
7c4792b0ac New translations translation.json (Chinese Traditional)
9b48afc344 New translations translation.json (Chinese Traditional)
9322dc36e3 New translations translation.json (Chinese Traditional)
18454b3923 New translations translation.json (Chinese Traditional)
5cea26d306 New translations translation.json (Chinese Traditional)
35932b096d New translations translation.json (Chinese Simplified)
404efd715c New translations translation.json (Chinese Simplified)
8e1b742c89 New translations translation.json (Chinese Simplified)
9099eaaa64 New translations translation.json (Chinese Simplified)
29ab3e1b43 New translations translation.json (Chinese Simplified)
b8a166b378 New translations translation.json (Chinese Traditional)
68675dc89e New translations translation.json (Chinese Traditional)
48984a91a9 New translations translation.json (Chinese Traditional)
aa5c3dcbc1 New translations translation.json (Chinese Traditional)
f1fb477169 New translations translation.json (Chinese Traditional)
ba198ad1a4 New translations translation.json (Chinese Traditional)
fe3dbc1bc1 New translations translation.json (Chinese Simplified)
2299dcae57 New translations translation.json (Chinese Simplified)
ccd43faab1 New translations translation.json (Chinese Simplified)
1dbec66684 New translations translation.json (Chinese Simplified)
eadaa734f7 New translations translation.json (Chinese Simplified)
df25fc97a4 New translations translation.json (Chinese Simplified)
0ea81269e3 New translations translation.json (Chinese Traditional)
a07ed515e0 New translations translation.json (Chinese Traditional)
41f8d1c41b New translations translation.json (Chinese Traditional)
ae05628886 New translations translation.json (Chinese Traditional)
a13ed149be New translations translation.json (Chinese Traditional)
fde4083eb5 New translations translation.json (Chinese Traditional)
4fa07fdd13 New translations translation.json (Chinese Traditional)
5ce394d720 New translations translation.json (Chinese Simplified)
ffafd87e8e New translations translation.json (Chinese Simplified)
59da1726df New translations translation.json (Chinese Simplified)
36959b0026 New translations translation.json (Chinese Simplified)
6b4033ec01 New translations translation.json (Chinese Simplified)
473b3d8ae7 New translations translation.json (Chinese Simplified)
3dcffa64f7 New translations translation.json (Portuguese, Brazilian)
d6684f80aa New translations translation.json (Chinese Traditional)
cd937b75fa New translations translation.json (Chinese Traditional)
701426127f New translations translation.json (Chinese Traditional)
547fbc1ed4 New translations translation.json (Chinese Traditional)
c13f8b527a New translations translation.json (Chinese Traditional)
2eae466628 New translations translation.json (Chinese Traditional)
38832ff9fd New translations translation.json (Chinese Simplified)
32b3d113e2 New translations translation.json (Chinese Simplified)
ac246508c3 New translations translation.json (Chinese Simplified)
f57782940b New translations translation.json (Chinese Simplified)
9a8d62f0c6 New translations translation.json (Chinese Simplified)
7b93068675 New translations translation.json (Chinese Simplified)
d517228c75 New translations translation.json (Chinese Simplified)
9c4569aeef New translations translation.json (Dutch)
4e1a832256 New translations translation.json (Japanese)
42f7c71f4e New translations translation.json (German)
ea205cf71b New translations translation.json (Spanish)
bef161d9a1 New translations translation.json (French)
2f7c04a7e8 New translations translation.json (Chinese Traditional)
05f96af620 New translations translation.json (Chinese Traditional)
a6666e9cbf New translations translation.json (Chinese Traditional)
305637b76e New translations translation.json (Chinese Traditional)
2b1a56865e New translations translation.json (Chinese Traditional)
e94094151e New translations translation.json (Chinese Traditional)
cdacb251ef New translations translation.json (Chinese Simplified)
0cbd4fd665 New translations translation.json (Chinese Simplified)
efd23d98ca New translations translation.json (Chinese Simplified)
f682201499 New translations translation.json (Chinese Simplified)
416571caf6 New translations translation.json (Chinese Simplified)
a3fc0ec973 New translations translation.json (Chinese Simplified)
2d95366d02 New translations translation.json (Chinese Traditional)
daf8600531 New translations translation.json (Chinese Traditional)
9275d8d183 New translations translation.json (Chinese Traditional)
6d7a92caee New translations translation.json (Chinese Traditional)
1b047ac746 New translations translation.json (Chinese Traditional)
14cb938009 New translations translation.json (Chinese Traditional)
7ed0c7a418 New translations translation.json (Chinese Simplified)
9087f99074 New translations translation.json (Chinese Simplified)
e61ad82451 New translations translation.json (Chinese Simplified)
d698e87a33 New translations translation.json (Chinese Simplified)
43b3821242 New translations translation.json (Chinese Simplified)
05d37e4592 New translations translation.json (Chinese Simplified)
fb8f4d6d19 New translations translation.json (Chinese Traditional)
99361547bd New translations translation.json (Chinese Traditional)
f0741ba255 New translations translation.json (Chinese Traditional)
c6d141bfa2 New translations translation.json (Chinese Traditional)
a126b51056 New translations translation.json (Chinese Traditional)
659738674b New translations translation.json (Chinese Traditional)
d1fb0e6def New translations translation.json (Chinese Traditional)
7d50c45175 New translations translation.json (Chinese Simplified)
4556364ed6 New translations translation.json (Chinese Simplified)
7f8be239a3 New translations translation.json (Chinese Simplified)
a1b4da1526 New translations translation.json (Chinese Simplified)
a720ff1422 New translations translation.json (Chinese Simplified)
9d933a3740 New translations translation.json (Chinese Simplified)
353b272e45 New translations translation.json (Chinese Traditional)
69c8dec16b New translations translation.json (Chinese Traditional)
b3368e4919 New translations translation.json (Chinese Traditional)
dd004f428c New translations translation.json (Chinese Traditional)
3bdb51791a New translations translation.json (Chinese Traditional)
0aabb920b4 New translations translation.json (Chinese Traditional)
aa61fd5233 New translations translation.json (Chinese Simplified)
78fdd30882 New translations translation.json (Chinese Simplified)
ab571c95d6 New translations translation.json (Chinese Simplified)
41f8b877d6 New translations translation.json (Chinese Simplified)
8f7c573e4b New translations translation.json (Chinese Simplified)
c725f8ef71 New translations translation.json (Chinese Simplified)
edea04e619 New translations translation.json (Chinese Simplified)
8812e3e958 New translations translation.json (Chinese Traditional)
e79aacc503 New translations translation.json (Chinese Traditional)
739dd4b901 New translations translation.json (Chinese Traditional)
effd4d42f2 New translations translation.json (Chinese Traditional)
3d0f820ca0 New translations translation.json (Chinese Traditional)
cf75f0571b New translations translation.json (Chinese Traditional)
2cc3d2addd New translations translation.json (Chinese Simplified)
9e42460756 New translations translation.json (Chinese Simplified)
d9e68984f0 New translations translation.json (Chinese Simplified)
a6bf1c5d70 New translations translation.json (Chinese Simplified)
e2da901988 New translations translation.json (Chinese Simplified)
c99462f609 New translations translation.json (Chinese Simplified)
42b21134a6 New translations translation.json (Chinese Traditional)
39a4e92c48 New translations translation.json (Chinese Traditional)
bca66de1d6 New translations translation.json (Chinese Traditional)
d0746822b4 New translations translation.json (Chinese Traditional)
1f2c9eef00 New translations translation.json (Chinese Traditional)
bf0de64738 New translations translation.json (Chinese Traditional)
a4fc637c82 New translations translation.json (Chinese Simplified)
c2994086bb New translations translation.json (Chinese Simplified)
a27a42a943 New translations translation.json (Chinese Simplified)
1b0064cdb8 New translations translation.json (Chinese Simplified)
6ad13300e5 New translations translation.json (Chinese Simplified)
6f8e764833 New translations translation.json (Chinese Simplified)
9897a8d427 New translations translation.json (Chinese Traditional)
395a69948a New translations translation.json (Chinese Traditional)
e7cc68d23f New translations translation.json (Chinese Traditional)
4b9733fc74 New translations translation.json (Chinese Traditional)
989c4d62fa New translations translation.json (Chinese Traditional)
273101f05d New translations translation.json (Chinese Traditional)
f9145e0f12 New translations translation.json (Chinese Traditional)
f669d6fb68 New translations translation.json (Chinese Simplified)
3546d1ccef New translations translation.json (Chinese Simplified)
49bf633e4c New translations translation.json (Chinese Simplified)
ae415ebf74 New translations translation.json (Chinese Simplified)
6eaa370d38 New translations translation.json (Chinese Simplified)
10473d87c1 New translations translation.json (Chinese Simplified)
808d8361a3 New translations translation.json (Chinese Traditional)
0605d7ed0d New translations translation.json (Chinese Traditional)
08c789d404 New translations translation.json (Chinese Traditional)
257fd0ee5f New translations translation.json (Chinese Traditional)
31b6d0b76b New translations translation.json (Chinese Traditional)
c2305720db New translations translation.json (Chinese Traditional)
cdc16fe9fc New translations translation.json (Chinese Simplified)
cc4bc620b1 New translations translation.json (Chinese Simplified)
82dbd4ea32 New translations translation.json (Chinese Simplified)
20beb38719 New translations translation.json (Chinese Simplified)
f2cc2c8120 New translations translation.json (Chinese Simplified)
f380810d81 New translations translation.json (Chinese Simplified)
91d9d346ec New translations translation.json (Chinese Simplified)
af268bfd91 New translations translation.json (Chinese Traditional)
2cd92b7dd7 New translations translation.json (Chinese Traditional)
c6bca840f3 New translations translation.json (Chinese Traditional)
8e5d30d322 New translations translation.json (Chinese Traditional)
4e9980c667 New translations translation.json (Chinese Traditional)
29710e7e0e New translations translation.json (Chinese Traditional)
b6a1604364 New translations translation.json (Chinese Simplified)
e470ba10f4 New translations translation.json (Chinese Simplified)
536f444948 New translations translation.json (Chinese Simplified)
b724143ecf New translations translation.json (Chinese Simplified)
53947b11c9 New translations translation.json (Chinese Simplified)
5bb6037d26 New translations translation.json (Chinese Simplified)
b3d7c8a49f New translations translation.json (Chinese Traditional)
8ec225bbee New translations translation.json (Chinese Traditional)
9c72abbdc3 New translations translation.json (Chinese Traditional)
6f0586c73d New translations translation.json (Chinese Traditional)
ff01748f2e New translations translation.json (Chinese Traditional)
ce95086c9b New translations translation.json (Chinese Traditional)
dbb9133919 New translations translation.json (Chinese Simplified)
071027a4ff New translations translation.json (Chinese Simplified)
f158ab692b New translations translation.json (Chinese Simplified)
982fb319f1 New translations translation.json (Chinese Simplified)
d03de7f707 New translations translation.json (Chinese Simplified)
90eae49335 New translations translation.json (Chinese Simplified)
5daf1135dc New translations translation.json (Chinese Traditional)
e4395f7218 New translations translation.json (Chinese Traditional)
5dd81e5587 New translations translation.json (Chinese Traditional)
6e1389a8a1 New translations translation.json (Chinese Traditional)
3700fd162d New translations translation.json (Chinese Traditional)
3a1d6ca525 New translations translation.json (Chinese Traditional)
8d6318b1c3 New translations translation.json (Chinese Traditional)
18e7dccfd4 New translations translation.json (Chinese Simplified)
586a9724ba New translations translation.json (Chinese Simplified)
a238ea5a16 New translations translation.json (Chinese Simplified)
5da57e03e6 New translations translation.json (Chinese Simplified)
19580a4fdf New translations translation.json (Chinese Simplified)
91a21ecd98 New translations translation.json (Chinese Simplified)
cca70fbcff New translations translation.json (Chinese Traditional)
af3bd96f92 New translations translation.json (Chinese Traditional)
5a05c03c11 New translations translation.json (Chinese Traditional)
b9c6f0b30d New translations translation.json (Chinese Traditional)
8f6b840524 New translations translation.json (Chinese Traditional)
9d55d40a32 New translations translation.json (Chinese Traditional)
18d03c0a93 New translations translation.json (Chinese Simplified)
46db16f2c8 New translations translation.json (Chinese Simplified)
82c689ed92 New translations translation.json (Chinese Simplified)
99038bbdfd New translations translation.json (Chinese Simplified)
ab2cfbb747 New translations translation.json (Chinese Simplified)
d8ad7ddf2b New translations translation.json (Chinese Simplified)
19711cfbeb New translations translation.json (Chinese Simplified)
0e31ea8381 New translations translation.json (Chinese Traditional)
ac292de449 New translations translation.json (Chinese Traditional)
6a1f3ae11b New translations translation.json (Chinese Traditional)
9bc73e87f9 New translations translation.json (Chinese Traditional)
c86f082e24 New translations translation.json (Chinese Traditional)
7521659ea2 New translations translation.json (Chinese Traditional)
ba44d1f190 New translations translation.json (Chinese Simplified)
d10d70d875 New translations translation.json (Chinese Simplified)
a73536cba7 New translations translation.json (Chinese Simplified)
6f28c76148 New translations translation.json (Chinese Simplified)
1c2b56883b New translations translation.json (Chinese Simplified)
6f1994d595 New translations translation.json (Chinese Simplified)
1d6ca69752 New translations translation.json (Chinese Traditional)
2bbe00b8d1 New translations translation.json (Chinese Traditional)
267f08fe59 New translations translation.json (Chinese Traditional)
5a3083e117 New translations translation.json (Chinese Traditional)
854d07dc55 New translations translation.json (Chinese Traditional)
a0db1e7c9e New translations translation.json (Chinese Traditional)
89999ef272 New translations translation.json (Chinese Simplified)
ca242b2813 New translations translation.json (Chinese Simplified)
b96a08c36d New translations translation.json (Chinese Simplified)
62120dee5a New translations translation.json (Chinese Simplified)
68a451a562 New translations translation.json (Chinese Simplified)
8c674ff156 New translations translation.json (Chinese Simplified)
399cfbd8b2 New translations translation.json (Chinese Traditional)
cc9c65d5b2 New translations translation.json (Chinese Traditional)
4221b4cbdc New translations translation.json (Chinese Traditional)
ae57938e18 New translations translation.json (Chinese Traditional)
039168c67f New translations translation.json (Chinese Traditional)
bc4ffa7525 New translations translation.json (Chinese Traditional)
65b4ce2bf0 New translations translation.json (Chinese Traditional)
409ce7f8ab New translations translation.json (Chinese Simplified)
0156ecd42f New translations translation.json (Chinese Simplified)
1f7c23cdc9 New translations translation.json (Chinese Simplified)
b02fe7d732 New translations translation.json (Chinese Simplified)
6126991839 New translations translation.json (Chinese Simplified)
082f23c9e7 New translations translation.json (Chinese Simplified)
7a844e620b New translations translation.json (Chinese Traditional)
fbb22212bf New translations translation.json (Chinese Traditional)
5b66c7d178 New translations translation.json (Chinese Traditional)
e67407af4e New translations translation.json (Chinese Traditional)
d6e82dbde2 New translations translation.json (Chinese Traditional)
1560138718 New translations translation.json (Chinese Traditional)
f1e005ce50 New translations translation.json (Chinese Simplified)
d86e44c88d New translations translation.json (Chinese Simplified)
8df959634e New translations translation.json (Chinese Simplified)
13c1ec02ac New translations translation.json (Chinese Simplified)
a394efa4e2 New translations translation.json (Chinese Simplified)
26dcee1fbe New translations translation.json (Chinese Simplified)
2da0b97d1f New translations translation.json (Chinese Simplified)
1edec87c48 New translations translation.json (Chinese Traditional)
aaea5ff993 New translations translation.json (Chinese Traditional)
d71d70c5f5 New translations translation.json (Chinese Traditional)
996454f502 New translations translation.json (Chinese Traditional)
692f124dfc New translations translation.json (Chinese Traditional)
7de1407539 New translations translation.json (Chinese Traditional)
896e131b03 New translations translation.json (Chinese Simplified)
7eda55e16b New translations translation.json (Chinese Simplified)
8bacbd6ad9 New translations translation.json (Chinese Simplified)
a1f391ac3c New translations translation.json (Chinese Simplified)
553fef062b New translations translation.json (Chinese Simplified)
5600987a58 New translations translation.json (Chinese Simplified)
92b8680094 New translations translation.json (Chinese Traditional)
050b67c686 New translations translation.json (Chinese Traditional)
4bab07144d New translations translation.json (Chinese Traditional)
5e339b707e New translations translation.json (Chinese Traditional)
2db3fcdb1f New translations translation.json (Chinese Traditional)
6ba13ce030 New translations translation.json (Chinese Traditional)
2a440e72fb New translations translation.json (Chinese Simplified)
ecbfd0dedd New translations translation.json (Chinese Simplified)
16d76ec32a New translations translation.json (Chinese Simplified)
3219b51752 New translations translation.json (Chinese Simplified)
2f67a5caf6 New translations translation.json (Chinese Simplified)
c87372cf45 New translations translation.json (Chinese Simplified)
a74ac240bf New translations translation.json (Chinese Traditional)
a0440fb7f3 New translations translation.json (Chinese Traditional)
3e5fb093d1 New translations translation.json (Chinese Traditional)
255006773f New translations translation.json (Chinese Traditional)
92b6b5da1a New translations translation.json (Chinese Traditional)
17a8f5e03b New translations translation.json (Chinese Traditional)
f07f273f1d New translations translation.json (Chinese Traditional)
c34de9c83c New translations translation.json (Chinese Simplified)
2b1d929df0 New translations translation.json (Chinese Simplified)
7e763930da New translations translation.json (Chinese Simplified)
b673607b0d New translations translation.json (Chinese Simplified)
4a2e02b88f New translations translation.json (Chinese Simplified)
d632f78548 New translations translation.json (Chinese Simplified)
9865b4310f New translations translation.json (Chinese Traditional)
fbc3be6ad9 New translations translation.json (Chinese Traditional)
89fc113e94 New translations translation.json (Chinese Traditional)
c670ddd45d New translations translation.json (Chinese Traditional)
e45c109338 New translations translation.json (Chinese Traditional)
392514999f New translations translation.json (Chinese Traditional)
df2b65e51f New translations translation.json (Chinese Simplified)
ba7dcd83be New translations translation.json (Chinese Simplified)
836bed6ea2 New translations translation.json (Chinese Simplified)
0a0495c2d6 New translations translation.json (Chinese Simplified)
f710a644b5 New translations translation.json (Chinese Simplified)
2b448efb2a New translations translation.json (Chinese Simplified)
0b42b71f81 New translations translation.json (Chinese Simplified)
f24e42d151 New translations translation.json (Chinese Traditional)
42596ab56a New translations translation.json (Chinese Traditional)
8f46258f8e New translations translation.json (Chinese Traditional)
a56376eded New translations translation.json (Chinese Traditional)
164e139b6f New translations translation.json (Chinese Traditional)
f6ca09c63c New translations translation.json (Chinese Traditional)
ec91b64e59 New translations translation.json (Chinese Simplified)
43d258bd46 New translations translation.json (Chinese Simplified)
348c0ee584 New translations translation.json (Chinese Simplified)
5985680292 New translations translation.json (Chinese Simplified)
4d210e3c27 New translations translation.json (Chinese Simplified)
fda30f8a5e New translations translation.json (Chinese Simplified)
cb8f832d02 New translations translation.json (Chinese Traditional)
1398ab2b05 New translations translation.json (Chinese Traditional)
fa89472719 New translations translation.json (Chinese Traditional)
15dafe32f3 New translations translation.json (Chinese Traditional)
d771c65a54 New translations translation.json (Chinese Traditional)
50190453af New translations translation.json (Chinese Traditional)
945da6f2e1 New translations translation.json (Chinese Simplified)
f3bf74db54 New translations translation.json (Chinese Simplified)
3c5d0981b7 New translations translation.json (Chinese Simplified)
f96bb8f886 New translations translation.json (Chinese Simplified)
3b50fd62d2 New translations translation.json (Chinese Simplified)
f3c8324264 New translations translation.json (Chinese Simplified)
f662ccb5a4 New translations translation.json (Chinese Traditional)
667139ba57 New translations translation.json (Chinese Traditional)
083ec2d563 New translations translation.json (Chinese Traditional)
363df5a13a New translations translation.json (Chinese Traditional)
ad9d746794 New translations translation.json (Chinese Traditional)
a8433d4850 New translations translation.json (Chinese Traditional)
dc67e15aaf New translations translation.json (Chinese Traditional)
72a2492a49 New translations translation.json (Chinese Simplified)
c99e3e91e2 New translations translation.json (Chinese Simplified)
891ec9b9eb New translations translation.json (Chinese Simplified)
e396ff7061 New translations translation.json (Chinese Simplified)
a7823a3953 New translations translation.json (Chinese Simplified)
76838b1a2b New translations translation.json (Chinese Simplified)
bff5c47999 New translations translation.json (Chinese Traditional)
0b2e9ff2ab New translations translation.json (Chinese Traditional)
54ae1cafd5 New translations translation.json (Chinese Traditional)
3c82042bc1 New translations translation.json (Chinese Traditional)
ab7428ef91 New translations translation.json (Chinese Traditional)
361082846f New translations translation.json (Chinese Traditional)
62592a110f New translations translation.json (Chinese Simplified)
dbe030cfd7 New translations translation.json (Chinese Simplified)
29a31cf220 New translations translation.json (Chinese Simplified)
5c1c410c2e New translations translation.json (Chinese Simplified)
de73cbf4dc New translations translation.json (Chinese Simplified)
88197bb80a New translations translation.json (Chinese Simplified)
b4a3caf76a New translations translation.json (Chinese Simplified)
32efffcd9e New translations translation.json (Chinese Traditional)
583ea6ae26 New translations translation.json (Chinese Traditional)
d2701e14f9 New translations translation.json (Chinese Traditional)
c573a5cd4c New translations translation.json (Chinese Traditional)
47af8d18c6 New translations translation.json (Chinese Traditional)
76fc06d82f New translations translation.json (Chinese Traditional)
aec23cdc12 New translations translation.json (Chinese Simplified)
a03d968ea0 New translations translation.json (Chinese Simplified)
9d0be94518 New translations translation.json (Chinese Simplified)
3c62a41fd3 New translations translation.json (Chinese Simplified)
b91ec48157 New translations translation.json (Chinese Simplified)
78cdd5016d New translations translation.json (Chinese Simplified)
dd4af25d46 New translations translation.json (Chinese Traditional)
952fb702c4 New translations translation.json (Chinese Traditional)
a240b5e181 New translations translation.json (Chinese Traditional)
7bc4b4cf60 New translations translation.json (Chinese Traditional)
f2d3650f47 New translations translation.json (Chinese Traditional)
db0d9237a2 New translations translation.json (Chinese Traditional)
e7e6e1c344 New translations translation.json (Chinese Simplified)
111fc97375 New translations translation.json (Chinese Simplified)
8b487764cc New translations translation.json (Chinese Simplified)
1d297fe89e New translations translation.json (Chinese Simplified)
580b6a745d New translations translation.json (Chinese Simplified)
59b2b83429 New translations translation.json (Chinese Simplified)
00262f26c6 New translations translation.json (Chinese Traditional)
8277ae41c6 New translations translation.json (Chinese Traditional)
93a0dcb99f New translations translation.json (Chinese Traditional)
09b390943b New translations translation.json (Chinese Traditional)
a5f49269da New translations translation.json (Chinese Traditional)
87d5142b1c New translations translation.json (Chinese Traditional)
685ef852e9 New translations translation.json (Chinese Traditional)
8f55591db2 New translations translation.json (Chinese Simplified)
8b63742724 New translations translation.json (Chinese Simplified)
68ad85ffe0 New translations translation.json (Chinese Simplified)
5cfaa85cd4 New translations translation.json (Chinese Simplified)
7268618f03 New translations translation.json (Chinese Simplified)
3fe309670f New translations translation.json (Chinese Simplified)
0fa5a5211b New translations translation.json (Chinese Traditional)
3065c39ad6 New translations translation.json (Chinese Traditional)
0f37d40592 New translations translation.json (Chinese Traditional)
8d9ea908f9 New translations translation.json (Chinese Traditional)
ae59ec6188 New translations translation.json (Chinese Traditional)
e4644455f1 New translations translation.json (Chinese Traditional)
69fbc31913 New translations translation.json (Chinese Simplified)
5b83d8593a New translations translation.json (Chinese Simplified)
49102819a1 New translations translation.json (Chinese Simplified)
748f60b6e5 New translations translation.json (Chinese Simplified)
7a9699a9d3 New translations translation.json (Chinese Simplified)
8a904b9602 New translations translation.json (Chinese Simplified)
4eb9d0adba New translations translation.json (Chinese Simplified)
4c2c948211 New translations translation.json (Chinese Traditional)
8b37b96708 New translations translation.json (Chinese Traditional)
a9cd1d06a3 New translations translation.json (Chinese Traditional)
84083e280b New translations translation.json (Chinese Traditional)
f74599ce4a New translations translation.json (Chinese Traditional)
9e48200726 New translations translation.json (Chinese Traditional)
1f9fc2b95b New translations translation.json (Chinese Simplified)
d5db292361 New translations translation.json (Chinese Simplified)
8f93346910 New translations translation.json (Chinese Simplified)
97133d38ee New translations translation.json (Chinese Simplified)
1718ab3a59 New translations translation.json (Chinese Simplified)
7854571893 New translations translation.json (Chinese Simplified)
1bd29e027b New translations translation.json (Chinese Traditional)
cda5e0fd88 New translations translation.json (Chinese Traditional)
ab99b7d7e1 New translations translation.json (Chinese Traditional)
4bcd425231 New translations translation.json (Chinese Traditional)
6aafc1a732 New translations translation.json (Chinese Traditional)
bf7c2db222 New translations translation.json (Chinese Traditional)
1d8280259f New translations translation.json (Chinese Simplified)
48f3c83c63 New translations translation.json (Chinese Simplified)
f4ef365deb New translations translation.json (Chinese Simplified)
3c9a1972dd New translations translation.json (Chinese Simplified)
8069a8f082 New translations translation.json (Chinese Simplified)
dfd04bdf34 New translations translation.json (Chinese Simplified)
b2e5b95f93 New translations translation.json (Chinese Traditional)
0b94b1d606 New translations translation.json (Chinese Traditional)
10de751811 New translations translation.json (Chinese Traditional)
ffb3419949 New translations translation.json (Chinese Traditional)
021936d8f9 New translations translation.json (Chinese Traditional)
c918cc2a19 New translations translation.json (Chinese Traditional)
d36ed654f9 New translations translation.json (Chinese Traditional)
842eb3dafe New translations translation.json (Chinese Simplified)
f1d934ea60 New translations translation.json (Chinese Simplified)
e5f9ad9523 New translations translation.json (Chinese Simplified)
ba079d489c New translations translation.json (Chinese Simplified)
7cbf89945f New translations translation.json (Chinese Simplified)
724e02a407 New translations translation.json (Chinese Simplified)
381bb64110 New translations translation.json (Chinese Traditional)
cee6e1632b New translations translation.json (Chinese Traditional)
cd0c8da3f2 New translations translation.json (Chinese Traditional)
0e0718f643 New translations translation.json (Chinese Traditional)
44308d038b New translations translation.json (Chinese Traditional)
bbbc144640 New translations translation.json (Chinese Traditional)
561f986d70 New translations translation.json (Chinese Simplified)
e0b31985c5 New translations translation.json (Chinese Simplified)
1ff1633fc3 New translations translation.json (Chinese Simplified)
712024921f New translations translation.json (Chinese Simplified)
de4c14f745 New translations translation.json (Chinese Simplified)
eae9a69555 New translations translation.json (Chinese Simplified)
582e62bdf7 New translations translation.json (Chinese Simplified)
d82c0e43d0 New translations translation.json (Chinese Traditional)
504822c411 New translations translation.json (Chinese Traditional)
f4c226f48f New translations translation.json (Chinese Traditional)
c2dd7d252b New translations translation.json (Chinese Traditional)
c4166efb1a New translations translation.json (Chinese Traditional)
d7d38c369e New translations translation.json (Chinese Traditional)
7e50f3d45c New translations translation.json (Chinese Simplified)
fa464c4040 New translations translation.json (Chinese Simplified)
e4bf3dc999 New translations translation.json (Chinese Simplified)
0337f40ea4 New translations translation.json (Chinese Simplified)
f482c74acf New translations translation.json (Chinese Simplified)
143ac3a7bc New translations translation.json (Chinese Simplified)
3cd73900ce New translations translation.json (Chinese Traditional)
35309cbad8 New translations translation.json (Chinese Traditional)
546e371e8e New translations translation.json (Chinese Traditional)
31e6ee3be9 New translations translation.json (Chinese Traditional)
38900befcb New translations translation.json (Chinese Traditional)
5a17761e0c New translations translation.json (Chinese Traditional)
c2ab24b6ae New translations translation.json (Chinese Simplified)
acc1af8c0f New translations translation.json (Chinese Simplified)
7f42edf732 New translations translation.json (Chinese Simplified)
fac3c5b81f New translations translation.json (Chinese Simplified)
661f2517af New translations translation.json (Chinese Simplified)
3dc2dacfc3 New translations translation.json (Chinese Simplified)
c567b85f3d New translations translation.json (Chinese Traditional)
23c5953627 New translations translation.json (Chinese Traditional)
b5a18e0580 New translations translation.json (Chinese Traditional)
e9562cc68e New translations translation.json (Chinese Traditional)
8c329a4e01 New translations translation.json (Chinese Traditional)
bbb0b3378a New translations translation.json (Chinese Traditional)
dc49db933d New translations translation.json (Chinese Traditional)
61c1b27fdc New translations translation.json (Chinese Simplified)
c4aeab0bab New translations translation.json (Chinese Simplified)
f756eca14a New translations translation.json (Chinese Simplified)
8afcff4b25 New translations translation.json (Chinese Simplified)
00fef65b35 New translations translation.json (Chinese Simplified)
135932c56f New translations translation.json (Chinese Simplified)
2b7c268d6d New translations translation.json (Chinese Traditional)
18d0436e26 New translations translation.json (Chinese Traditional)
c32303ee2f New translations translation.json (Chinese Traditional)
9534e379dc New translations translation.json (Chinese Traditional)
d4dc6a6647 New translations translation.json (Chinese Traditional)
5005fa7587 New translations translation.json (Chinese Traditional)
fd0cb217dd New translations translation.json (Chinese Simplified)
0f823b7429 New translations translation.json (Chinese Simplified)
4019903447 New translations translation.json (Chinese Simplified)
3b06b053de New translations translation.json (Chinese Simplified)
9932cd899e New translations translation.json (Chinese Simplified)
345c2df1d2 New translations translation.json (Chinese Simplified)
27a10fce86 New translations translation.json (Chinese Simplified)
fcccf58e7f New translations translation.json (Chinese Traditional)
bda67a4065 New translations translation.json (Chinese Traditional)
a6bc679224 New translations translation.json (Chinese Traditional)
1442b58888 New translations translation.json (Chinese Traditional)
144b0cb52d New translations translation.json (Chinese Traditional)
e494093c8b New translations translation.json (Chinese Traditional)
8303f96edb New translations translation.json (Chinese Simplified)
6319398ec4 New translations translation.json (Chinese Simplified)
f64231c4be New translations translation.json (Chinese Simplified)
fa7c4ee1d1 New translations translation.json (Chinese Simplified)
4f18aa0e7b New translations translation.json (Chinese Simplified)
f7b9ddae05 New translations translation.json (Chinese Simplified)
cac6035d3e New translations translation.json (Chinese Traditional)
df0181a0ba New translations translation.json (Chinese Traditional)
77dd66ead5 New translations translation.json (Chinese Traditional)
ef53e2d081 New translations translation.json (Chinese Traditional)
ca525bf737 New translations translation.json (Chinese Traditional)
533408440a New translations translation.json (Chinese Traditional)
51cbde315b New translations translation.json (Chinese Simplified)
c77f21ecbb New translations translation.json (Chinese Simplified)
bd8fdeac56 New translations translation.json (Chinese Simplified)
fc7613f123 New translations translation.json (Chinese Simplified)
fc40605cfa New translations translation.json (Chinese Simplified)
34c641b74d New translations translation.json (Chinese Simplified)
ffc767558d New translations translation.json (Chinese Traditional)
5e0f1b89ef New translations translation.json (Chinese Traditional)
99627abe96 New translations translation.json (Chinese Traditional)
d43030e953 New translations translation.json (Chinese Traditional)
2baf77a622 New translations translation.json (Chinese Traditional)
e81f986ef5 New translations translation.json (Chinese Traditional)
f85f29dc98 New translations translation.json (Chinese Traditional)
67c9b9eed9 New translations translation.json (Chinese Simplified)
0c0c73d090 New translations translation.json (Chinese Simplified)
227aabe24e New translations translation.json (Chinese Simplified)
0d5c8b551c New translations translation.json (Chinese Simplified)
b1f9484bb7 New translations translation.json (Chinese Simplified)
c8ed434fd0 New translations translation.json (Chinese Simplified)
4d53c3dbcc New translations translation.json (Chinese Traditional)
fac5e5e152 New translations translation.json (Chinese Traditional)
8a7128d3f5 New translations translation.json (Chinese Traditional)
b485453b46 New translations translation.json (Chinese Traditional)
09016f844c New translations translation.json (Chinese Traditional)
6675eb087a New translations translation.json (Chinese Traditional)
e2c03f2117 New translations translation.json (Chinese Simplified)
7077f4b479 New translations translation.json (Chinese Simplified)
da0a437a35 New translations translation.json (Chinese Simplified)
089c74e953 New translations translation.json (Chinese Simplified)
72ee0ab1b0 New translations translation.json (Chinese Simplified)
e6fc3b24fe New translations translation.json (Chinese Simplified)
2b9efb4c87 New translations translation.json (Chinese Simplified)
7eea60a9df New translations translation.json (Chinese Traditional)
c553e53474 New translations translation.json (Chinese Traditional)
c1d451bb9c New translations translation.json (Chinese Traditional)
9ec91e73cf New translations translation.json (Chinese Traditional)
a41ee6f836 New translations translation.json (Chinese Traditional)
1986cd94b6 New translations translation.json (Chinese Traditional)
cfefc05813 New translations translation.json (Chinese Simplified)
4272eec94f New translations translation.json (Chinese Simplified)
3a948bfafd New translations translation.json (Chinese Simplified)
409fbb5c23 New translations translation.json (Chinese Simplified)
c3f0ff5133 New translations translation.json (Chinese Simplified)
2a1877c31e New translations translation.json (Chinese Simplified)
bd389445aa New translations translation.json (Chinese Traditional)
096acfdc18 New translations translation.json (Chinese Traditional)
c6ff9014f7 New translations translation.json (Chinese Traditional)
185ee869b2 New translations translation.json (Chinese Traditional)
01a2c2ec6d New translations translation.json (Chinese Traditional)
c1e3d81ea4 New translations translation.json (Chinese Traditional)
61df28b87c New translations translation.json (Chinese Simplified)
1654fcf4ad New translations translation.json (Chinese Simplified)
991a930e20 New translations translation.json (Chinese Simplified)
fedfb0a628 New translations translation.json (Chinese Simplified)
5417138e10 New translations translation.json (Chinese Simplified)
6a83c2be5d New translations translation.json (Chinese Simplified)
5d9d38aaba New translations translation.json (Chinese Traditional)
8ccf39bd6e New translations translation.json (Chinese Traditional)
72eab83e76 New translations translation.json (Chinese Traditional)
0b1ddbe76e New translations translation.json (Chinese Traditional)
885ca20352 New translations translation.json (Chinese Traditional)
2b13b26057 New translations translation.json (Chinese Traditional)
d90736b898 New translations translation.json (Chinese Traditional)
521390041b New translations translation.json (Chinese Simplified)
77103eb760 New translations translation.json (Chinese Simplified)
579d3245cf New translations translation.json (Chinese Simplified)
e1cb34120e New translations translation.json (Chinese Simplified)
7d3687333b New translations translation.json (Chinese Simplified)
84d9942222 New translations translation.json (Chinese Simplified)
1668917c20 New translations translation.json (Chinese Traditional)
793e63940c New translations translation.json (Chinese Traditional)
6b46eb70fe New translations translation.json (Chinese Traditional)
aa66239ee6 New translations translation.json (Chinese Traditional)
5432429d36 New translations translation.json (Chinese Traditional)
86a4d88b78 New translations translation.json (Chinese Traditional)
60988f4981 New translations translation.json (Chinese Simplified)
020698f42b New translations translation.json (Chinese Simplified)
8ea070793e New translations translation.json (Chinese Simplified)
f9bb02a4f8 New translations translation.json (Chinese Simplified)
ab09b30025 New translations translation.json (Chinese Simplified)
9704957069 New translations translation.json (Chinese Simplified)
a3eb40a9d7 New translations translation.json (Chinese Simplified)
ac01ec5965 New translations translation.json (Chinese Traditional)
4dc235d816 New translations translation.json (Chinese Traditional)
fcbd7f7a72 New translations translation.json (Chinese Traditional)
8bac3c1d00 New translations translation.json (Chinese Traditional)
ea15ffb6bf New translations translation.json (Chinese Traditional)
3ace22ca4a New translations translation.json (Chinese Traditional)
97478289fc New translations translation.json (Chinese Simplified)
b30c7655c5 New translations translation.json (Chinese Simplified)
dcd6b8aa18 New translations translation.json (Chinese Simplified)
9b74aee472 New translations translation.json (Chinese Simplified)
b3a5f03000 New translations translation.json (Chinese Simplified)
56ffceb596 New translations translation.json (Chinese Simplified)
9475d38f90 New translations translation.json (Chinese Traditional)
c5cf0aa1fa New translations translation.json (Chinese Traditional)
fe6b7a49fa New translations translation.json (Chinese Traditional)
adf0a3a6d5 New translations translation.json (Chinese Traditional)
d12e09d9c6 New translations translation.json (Chinese Traditional)
31e6ab1d9d New translations translation.json (Portuguese, Brazilian)
16c8ee4e90 New translations translation.json (Chinese Traditional)
7c2166f07e New translations translation.json (Chinese Simplified)
7ea0d7d02a New translations translation.json (Chinese Simplified)
55dfc66d5d New translations translation.json (Chinese Simplified)
6f786cb0b5 New translations translation.json (Chinese Simplified)
e09941a868 New translations translation.json (Chinese Simplified)
3535ed5534 New translations translation.json (Chinese Simplified)
b870fa153a New translations translation.json (Dutch)
83aa96ab0b New translations translation.json (Japanese)
5593b2248b New translations translation.json (German)
b10332ff87 New translations translation.json (Spanish)
51ca989449 New translations translation.json (French)
5dd0370057 feat: New translation files (#9039)
8ad598fc16 Merge pull request #9035 from kishanprmr/google-forms-res
5e206e7f9a Merge pull request #9036 from kishanprmr/gsheets-disable-trigger
b780666303 Merge pull request #9037 from activepieces/revert-9034-feat/releasev0.68.3
2b6c49083c Revert "chore: bump releases"
d9f7f81a1b fix(google-sheets): fix onDisable error not allowing to save the flow
4952b9a065 fix(google-forms): sort form response for latest data
e69e313f47 Merge pull request #9034 from activepieces/feat/releasev0.68.3
ffde67384c chore: bump releases
16322bdc80 Merge pull request #9023 from activepieces/feat/nano-banana
018587d107 Merge pull request #8986 from fortunamide/wealthbox
cbc2b45316 refactor(errors): update error type names for trigger status clarity
09b219be64 refactor(errors): rename TRIGGER_ENABLE and TRIGGER_DISABLE to TRIGGER_UPDATE_STATUS for clarity
49ac34a749 Merge remote-tracking branch 'upstream/main' into wealthbox
6339476c3b feat: rename wealthbox-api to wealthbox and implement comprehensive API integration
a7f85a4a43 Merge branch 'main' into feat/nano-banana
5390b25913 Merge pull request #9033 from activepieces/test/ci
6b3f47513a Merge branch 'test/ci' of https://github.com/activepieces/activepieces into test/ci
9de213f9e9 feat(engine): add build-pieces-for-testing command and update test dependencies
5fbbfc7ab4 Merge branch 'main' into test/ci
7b35add9fe Merge pull request #9031 from activepieces/refacor/piece-loading
95835cec2f ci: build requires pieces for tests
87dc837c6a fix: lint
0215561124 fix: initializing i18n for piece scripts util
24b1193f4b feat(utils): refactor piece loading
6e6eaf3ab2 chore(shared): bump version to 0.20.1
4d2766954e Merge pull request #9029 from kishanprmr/shopify-email-marketing-status
7370c9cf72 fix: lint
a6aadbd1c0 Merge pull request #9027 from codegino/fix-predict-leads-technology
d78e203be9 chore(predictleads): bump piece version to 0.0.3
9a53db6b68 fix(shopify): add marketing consent

Files changed:
.claude/claude_hooks_config.json
.claude/hooks/adr_completion_hook.py
.claude/hooks/adr_post_hook.py
.env.test
.github/workflows/adr-generator.yml
.prettierrc.json
NAVIGATION_IMPLEMENTATION_REPORT.md
adr/README.md
adr/adr-20250903-001-sop-customization-approach.md
adr/adr-20250903-002-phase-2-group-d-ui-customization-completion.md
adr/adr-20250903-003-phase-2-group-e-completion---navigation-and-branding.md
adr/adr-20250903-004-phase-completion.md
adr/adr-YYYYMMDD-nn-short-title.md
adr/full-adr-automation.md
analysis/activepieces-analysis.md
analysis/client-requirements.md
analysis/codebase-analysis-current.md
analysis/customization-roadmap.md
analysis/technical-feasibility.md
architecture/custom-pieces-design.md
architecture/system-overview.md
architecture/ui-customization-plan.md
dependency-graph.md
deployment-guide.md
docker-compose.yml
docker/.env.docker
docker/Dockerfile.backend
docker/Dockerfile.frontend
docker/Dockerfile.production
docker/docker-compose.yml
docker/init-scripts/01-create-tables.sql
docker/nginx/nginx.conf
docker/production.docker-compose.yml
docs/SOP_UTILITIES_ARCHITECTURE.md
execution.md
implementation/phase-1-setup.md
implementation/phase-2-customization.md
implementation/phase-3-sop-pieces.md
implementation/phase-4-integration-export.md
jest.config.js
minimal-sparc-plan.md
monitoring/health-check.ts
package-lock.json
package.json
packages/pieces/community/sop-framework/README.md
packages/pieces/community/sop-framework/package.json
packages/pieces/community/sop-framework/project.json
packages/pieces/community/sop-framework/src/common/sop-auth.ts
packages/pieces/community/sop-framework/src/common/sop-props.ts
packages/pieces/community/sop-framework/src/constants/sop-constants.ts
packages/pieces/community/sop-framework/src/framework/base-sop-piece.ts
packages/pieces/community/sop-framework/src/framework/sop-execution-engine.ts
packages/pieces/community/sop-framework/src/framework/sop-integration-helpers.ts
packages/pieces/community/sop-framework/src/framework/sop-piece-registry.ts
packages/pieces/community/sop-framework/src/framework/sop-validation-framework.ts
packages/pieces/community/sop-framework/src/framework/sop-workflow-context.ts
packages/pieces/community/sop-framework/src/index.ts
packages/pieces/community/sop-framework/src/types/sop-execution-types.ts
packages/pieces/community/sop-framework/src/types/sop-types.ts
packages/pieces/community/sop-framework/src/types/sop-workflow-types.ts
packages/pieces/community/sop-framework/src/utils/sop-formatters.ts
packages/pieces/community/sop-framework/src/utils/sop-helpers.ts
packages/pieces/community/sop-framework/src/utils/sop-validators.ts
packages/pieces/community/sop-framework/tsconfig.json
packages/react-ui/src/app/app.tsx
packages/react-ui/src/app/components/appearance-settings.tsx
packages/react-ui/src/assets/SOP_ASSET_README.md
packages/react-ui/src/assets/img/sop/icons/compliance-check.svg
packages/react-ui/src/assets/img/sop/icons/human-task.svg
packages/react-ui/src/assets/img/sop/icons/integration.svg
packages/react-ui/src/assets/img/sop/icons/process-step.svg
packages/react-ui/src/assets/img/sop/logos/sop-icon.svg
packages/react-ui/src/assets/img/sop/logos/sop-logo.svg
packages/react-ui/src/assets/sop-manifest.json
packages/react-ui/src/assets/templates/sop-export-template.css
packages/react-ui/src/components/branding/brand-control-panel.tsx
packages/react-ui/src/components/branding/brand-switcher.tsx
packages/react-ui/src/components/branding/branding-demo.tsx
packages/react-ui/src/components/branding/branding-provider.tsx
packages/react-ui/src/components/sop/README.md
packages/react-ui/src/components/sop/THEME_SYSTEM_README.md
packages/react-ui/src/components/sop/comprehensive-theme-demo.tsx
packages/react-ui/src/components/sop/enhanced-theme-switcher.tsx
packages/react-ui/src/components/sop/index.ts
packages/react-ui/src/components/sop/process-flow-layout.tsx
packages/react-ui/src/components/sop/sop-dashboard.tsx
packages/react-ui/src/components/sop/sop-demo.tsx
packages/react-ui/src/components/sop/sop-header.tsx
packages/react-ui/src/components/sop/sop-layout-demo.tsx
packages/react-ui/src/components/sop/sop-sidebar.tsx
packages/react-ui/src/components/sop/sop-theme-provider.tsx
packages/react-ui/src/components/sop/sop-theme-switcher.tsx
packages/react-ui/src/components/sop/step-by-step-view.tsx
packages/react-ui/src/components/sop/theme-integration-test.tsx
packages/react-ui/src/components/theme/theme-system-provider.tsx
packages/react-ui/src/hooks/use-branding.ts
packages/react-ui/src/hooks/use-theme-manager.ts
packages/react-ui/src/lib/branding/README.md
packages/react-ui/src/lib/branding/branding-service.ts
packages/react-ui/src/lib/branding/index.ts
packages/react-ui/src/lib/sop-asset-test.tsx
packages/react-ui/src/lib/sop-assets.ts
packages/react-ui/src/lib/terminology/README.md
packages/react-ui/src/lib/terminology/components.tsx
packages/react-ui/src/lib/terminology/example-usage.tsx
packages/react-ui/src/lib/terminology/hooks.ts
packages/react-ui/src/lib/terminology/i18n-integration.ts
packages/react-ui/src/lib/terminology/index.ts
packages/react-ui/src/lib/terminology/mappings.ts
packages/react-ui/src/lib/terminology/service.ts
packages/react-ui/src/lib/terminology/setup.ts
packages/react-ui/src/lib/terminology/test-utils.ts
packages/react-ui/src/lib/terminology/types.ts
packages/react-ui/src/lib/terminology/utils.ts
packages/react-ui/src/lib/theme-config.ts
packages/react-ui/src/lib/use-sop-assets.tsx
packages/react-ui/src/styles.css
packages/react-ui/src/styles/sop-theme.css
packages/react-ui/src/types/branding.d.ts
packages/react-ui/src/types/sop-assets.d.ts
packages/react-ui/src/types/theme-system.d.ts
packages/react-ui/vite.config.ts
packages/server/api/src/app/flows/flow/flow.service.ts
scripts/clean.sh
scripts/database-reset.sh
scripts/dev.sh
scripts/generate-adr.js
scripts/package.json
scripts/setup.sh
sop-config-backup/README.md
sop-config-backup/analysis/activepieces-analysis.md
sop-config-backup/analysis/client-requirements.md
sop-config-backup/analysis/codebase-analysis-current.md
sop-config-backup/analysis/customization-roadmap.md
sop-config-backup/analysis/technical-feasibility.md
sop-config-backup/architecture/custom-pieces-design.md
sop-config-backup/architecture/system-overview.md
sop-config-backup/architecture/ui-customization-plan.md
sop-config-backup/dependency-graph.md
sop-config-backup/deployment-guide.md
sop-config-backup/docker/.env.docker
sop-config-backup/docker/Dockerfile.backend
sop-config-backup/docker/Dockerfile.frontend
sop-config-backup/docker/Dockerfile.production
sop-config-backup/docker/docker-compose.yml
sop-config-backup/docker/init-scripts/01-create-tables.sql
sop-config-backup/docker/nginx/nginx.conf
sop-config-backup/docker/production.docker-compose.yml
sop-config-backup/execution.md
sop-config-backup/implementation/phase-1-setup.md
sop-config-backup/implementation/phase-2-customization.md
sop-config-backup/implementation/phase-3-sop-pieces.md
sop-config-backup/implementation/phase-4-integration-export.md
sop-config-backup/jest.config.js
sop-config-backup/minimal-sparc-plan.md
sop-config-backup/monitoring/health-check.ts
sop-config-backup/nx.json
sop-config-backup/package-lock.json
sop-config-backup/package.json
sop-config-backup/scripts/clean.sh
sop-config-backup/scripts/database-reset.sh
sop-config-backup/scripts/dev.sh
sop-config-backup/scripts/setup.sh
sop-config-backup/src/backend/config/logging.config.ts
sop-config-backup/src/backend/database/database-config.ts
sop-config-backup/src/backend/database/migrations/.gitkeep
sop-config-backup/src/backend/database/migrations/1709654321000-InitialSopSchema.ts
sop-config-backup/src/backend/database/subscribers/.gitkeep
sop-config-backup/src/backend/middleware/logging.middleware.ts
sop-config-backup/src/backend/modules/sop/.gitkeep
sop-config-backup/src/backend/utils/logger.ts
sop-config-backup/src/frontend/app/modules/sop-designer/.gitkeep
sop-config-backup/src/pieces/sop-pieces/.gitkeep
sop-config-backup/src/shared/models/.gitkeep
sop-config-backup/testing-strategy.md
sop-config-backup/tests/backend-setup.ts
sop-config-backup/tests/e2e-setup.ts
sop-config-backup/tests/frontend-setup.ts
sop-config-backup/tests/global-teardown.ts
sop-config-backup/tests/integration-setup.ts
sop-config-backup/tests/setup.ts
sop-config-backup/tsconfig.json
sop-config-backup/webpack.config.js
sop-extensions/analysis/activepieces-analysis.md
sop-extensions/analysis/client-requirements.md
sop-extensions/analysis/codebase-analysis-current.md
sop-extensions/analysis/customization-roadmap.md
sop-extensions/analysis/technical-feasibility.md
sop-extensions/architecture/custom-pieces-design.md
sop-extensions/architecture/system-overview.md
sop-extensions/architecture/ui-customization-plan.md
sop-extensions/implementation/phase-1-setup.md
sop-extensions/implementation/phase-2-customization.md
sop-extensions/implementation/phase-3-sop-pieces.md
sop-extensions/implementation/phase-4-integration-export.md
sop-extensions/monitoring/health-check.ts
src/backend/config/logging.config.ts
src/backend/database/database-config.ts
src/backend/database/migrations/.gitkeep
src/backend/database/migrations/1709654321000-InitialSopSchema.ts
src/backend/database/subscribers/.gitkeep
src/backend/middleware/logging.middleware.ts
src/backend/modules/sop/.gitkeep
src/backend/utils/index.ts
src/backend/utils/logger.ts
src/backend/utils/sop-activepieces-integration.ts
src/backend/utils/sop-compliance-tools.ts
src/backend/utils/sop-process-utilities.ts
src/backend/utils/sop-testing-utilities.ts
src/backend/utils/sop-validators.ts
src/backend/utils/sop-workflow-helpers.ts
src/frontend/app/modules/sop-designer/.gitkeep
src/frontend/dashboard/README.md
src/frontend/dashboard/analytics-dashboard.tsx
src/frontend/dashboard/dashboard-layout.tsx
src/frontend/dashboard/dashboard-provider.tsx
src/frontend/dashboard/examples/complete-dashboard-example.tsx
src/frontend/dashboard/index.ts
src/frontend/dashboard/quick-actions-center.tsx
src/frontend/dashboard/sop-dashboard.tsx
src/frontend/dashboard/sop-management-panel.tsx
src/frontend/dashboard/team-collaboration-interface.tsx
src/frontend/dashboard/widgets/process-overview-widget.tsx
src/frontend/dashboard/widgets/widget-container.tsx
src/frontend/navigation/README.md
src/frontend/navigation/examples/integrated-layout-example.tsx
src/frontend/navigation/index.ts
src/frontend/navigation/navigation-provider.tsx
src/frontend/navigation/process-navigation.tsx
src/frontend/navigation/quick-actions.tsx
src/frontend/navigation/sop-breadcrumbs.tsx
src/frontend/navigation/sop-navigation.tsx
src/frontend/navigation/types.ts
src/pieces/sop-pieces/.gitkeep
src/shared/models/.gitkeep
src/types/activepieces-integration.ts
src/types/index.ts
src/types/sop-core.ts
src/types/sop-data-models.ts
testing-strategy.md
tests/backend-setup.ts
tests/e2e-setup.ts
tests/frontend-setup.ts
tests/global-teardown.ts
tests/integration-setup.ts
tests/setup.ts
tests/sop-utilities.test.ts
tsconfig.json
webpack.config.js

## Decision

Documented recent architectural changes and development progress

## Alternatives Considered



## Consequences

Improved traceability of development decisions and changes

## References


