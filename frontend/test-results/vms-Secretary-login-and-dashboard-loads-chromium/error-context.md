# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - img [ref=e9]
    - heading "STREAK ON!" [level=2] [ref=e11]
    - paragraph [ref=e12]:
      - text: You've logged in
      - generic [ref=e13]: 1 days
      - text: in a row. Keep the fire burning!
    - button "Let's Go!" [ref=e14]
  - generic [ref=e15]:
    - img "NSS Logo" [ref=e17]
    - heading "Welcome Back" [level=2] [ref=e18]
    - paragraph [ref=e19]: Sign in to your NSS account
  - generic [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]: Email Address
        - generic [ref=e25]:
          - img [ref=e26]
          - textbox "name@college.edu" [ref=e29]: test_sec@hbtu.ac.in
      - generic [ref=e30]:
        - generic [ref=e31]: Password
        - generic [ref=e32]:
          - img [ref=e33]
          - textbox "••••••••" [ref=e36]: Password123!
      - button "Sign In" [active] [ref=e37]:
        - generic [ref=e38]: Sign In
    - paragraph [ref=e40]:
      - text: Don't have an account?
      - link "Register here" [ref=e41] [cursor=pointer]:
        - /url: /register
```