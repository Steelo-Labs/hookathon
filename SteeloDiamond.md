**Project Overview:**

Steelo is an innovative decentralized mobile application that redefines the creator economy by empowering creators and their communities through blockchain technology. It bridges the gap between creators, fans, and investors using a dual-token system, fostering direct engagement and equitable distribution of value. Steelo is built on a modular architecture that ensures scalability, maintainability, and adaptability. Through Steelo, creators can tokenise themselves, converting fans into investors. 

**App Features:**

The app is broken down into 5 key features, all of which are interconnected and work together to create a seamless user experience powered by our dual-token system:
- Bazaar -> the Marketplace -> Buy, Sell, Trade and search for $STZ and $CONTENT
- Mosaic -> the Content Feed -> Discover creators and explore their token-gated content
- Village -> the Community Hub -> DMs and token-gated $STZ-specific community chats
- Gallery -> the Wallet -> Manage your $STLO, $STZ and $CONTENT deposits, withdrawals and transactions
- Profile -> the Portfolio -> Showcase all your interactions with the platform

**Architectural Overview:**

1. **Diamond Architecture:**
   - Steelo's core is based on a modular EIP2535 diamond architecture, which organizes the platform's functionalities into discrete, replaceable components called **facets**. This allows dynamic addition, replacement, or removal of features without disrupting the overall system.
   - The architecture handles various operational aspects such as token management, content management, user roles, and administrative functions.

2. **Key Libraries:**
   - **Diamond Management:** Manages all operations related to the diamond structure, including upgrade mechanisms.
   - **Access Control:** Oversees user permissions and roles, ensuring secure interaction among facets.
   - **Token Management:** Manages the lifecycle and operations of platform tokens, including the native $STLO (STEELO) token and creator-specific $STZ (STEEZ) tokens.
   - **Content Management:** Facilitates the management, distribution, and monetization of digital content.

3. **Facets and Responsibilities:**
   - **Token Operations:** Facets responsible for managing token creation, distribution, transactions, staking, and governance.
   - **User Management:** Facets for user account creation, role management, and smart account operations.
   - **Feature Mechanisms:** Facets for handling the mobile app's 5 key features which are Bazaar, Mosaic, Village, Gallery and Profile. 
   - **Token-Gated Experiences:** Facets for handling the creation, upload, and management of digital content, including exclusive access tied to Steez ownership.
   - **Governance:** Facilitates Steelo Improvement Protocols (SIPs), enabling community-driven decisions on platform upgrades and governance policies.

4. **User Experience Design:**
   - **Pre-Launch:** Ensures that all facets and functionalities work seamlessly before the platform goes live.
   - **Post-Launch:** Manages major upgrades, bug fixes, and quality-of-life improvements through SIPs.
   - **Token-Gating and Permissions:** Manages safe smart account rights, token-gating mechanisms, and other permissions to secure the user experience.

**Tech Stack:**

1. **Blockchain:**
   - Steelo is built on the Polygon zkEVM blockchain, integrating key tools such as:
     - **Uniswap v4:** Facilitates liquidity provision and token trading.
     - **Safe{core}:** For secure management of smart contracts and transactions.
     - **Firebase:** For scalable backend services and frictionless user experiences.

2. **Dual-Token System:**
   - **$STLO (STEELO):** The platform’s governance and utility token. Encapsulates the ecosystem's value.
     - Lifecycle: TGE > Inflationary phase (Minting) > 1B $STZ transactions > Deflationary phase (Minting + Burning).
     - Utility: Transactions and Staking, which also gives stake-weighted voting in SIPs.
     - Rates: Minting based on $STZ transaction rate.
   - **$STZ (STEEZ):** Creator-specific tokens that allow investors to own a stake in their favorite creators’ success and community.
     - Lifecycle: Pre-Order, Launch, Anniversary, Limit Order Book, Steez-for-Steez Swaps.
     - Volume: 250 $STZ during Pre-Order and 250 $STZ during Launch. Every year after that, 500 $STZ on Anniversary.
     - Fee Distribution: All fees associated with mints, trades and swaps are distributed to the $STZ's creator, investors, and Steelo. 
   - **$CONTENT:** Creator-specific collectable content associated with exclusive Mosaic content.
     - Lifecycle: Collected, Traded, Burned.
     - Mint Options: Limited Time or Quantity.
     - Price Options: Free, Creator-Set or Auction.

**Copilot Instructions:**

1. **Understanding Context:**
   - Ensure that all modifications or new implementations respect the modular nature of the diamond architecture. When adding new features or altering existing ones, identify the relevant facets and associated libraries to ensure seamless integration. Ensure you aren't unnecessarily removing or modifying code that isn't relevant to the task at hand.

2. **Optimizing Simplicity:**
   - Focus on simplicity and efficiency when solving tasks. Avoid unnecessary complexity or over-engineering. Prioritize solutions that align with Steelo’s modular design and existing architecture.

3. **Dynamic Functionality:**
   - Avoid hardcoding specific function names in implementations. Allow the system to dynamically reference and invoke the appropriate functionalities based on the current architecture and evolving needs.

4. **Documentation and Research:**
   - Document all changes clearly and ensure that any modifications are well-integrated into the existing documentation framework. Please also research relevant code sections to ensure consistency and accuracy in any new developments.

**Conclusion:**

This prompt ensures that you have the necessary context and guidance to assist with the development, maintenance, and enhancement of Steelo’s platform. The focus should remain on modularity, simplicity, user experience, and optimal solutions, ensuring that Steelo remains a leader in the decentralized creator economy.