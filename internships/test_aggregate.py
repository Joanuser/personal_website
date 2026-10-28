import unittest

import aggregate


class ClassifyTests(unittest.TestCase):
    def test_sponsorship_available(self):
        kind, evidence = aggregate.classify_text(
            "Visa sponsorship is available for eligible international students in this internship."
        )
        self.assertEqual(kind, "sponsorship")
        self.assertIn("sponsorship", evidence.lower())

    def test_refuses_sponsorship(self):
        kind, _ = aggregate.classify_text(
            "Applicants must be authorized to work in the United States without the need for visa sponsorship now or in the future."
        )
        self.assertEqual(kind, "no")

    def test_cpt_without_long_term_sponsorship(self):
        kind, _ = aggregate.classify_text(
            "We are unable to sponsor employment visas. Students on CPT or OPT are welcome to apply."
        )
        self.assertEqual(kind, "cpt_opt")

    def test_citizenship_required(self):
        kind, _ = aggregate.classify_text("This internship requires U.S. citizenship.")
        self.assertEqual(kind, "no")

    def test_optional_is_not_opt(self):
        kind, _ = aggregate.classify_text(
            "The optional rotation lets interns choose a team after the first month of the program."
        )
        self.assertEqual(kind, "unknown")

    def test_h1b_history_is_not_acceptance(self):
        kind, _ = aggregate.classify_text(
            "Arcesium has a track record of offering H1B sponsorships, with 2 in 2026 and 4 in 2025. "
            "Please note that this does not guarantee sponsorship for this specific role."
        )
        self.assertEqual(kind, "unknown")

    def test_negated_sponsorship_is_not_a_yes(self):
        samples = [
            "This is not a position for which sponsorship will be provided.",
            "We don't sponsor visas for internships, and the application asks you to confirm this.",
            "This role is not eligible for CPT, OPT or sponsorship now or in the future.",
            "F-1 visa holders with Optional Practical Training (OPT) who will require H-1B status will not be considered.",
            "Applicants must be authorized to work for any employer in the US. We are unable to support or sponsor any US immigration benefit, including STEM OPT.",
        ]
        for sample in samples:
            kind, _ = aggregate.classify_text(sample)
            self.assertEqual(kind, "no", sample)

    def test_real_cpt_welcome(self):
        kind, _ = aggregate.classify_text(
            "F-1 students are eligible if they are using Curricular Practical Training (CPT)."
        )
        self.assertEqual(kind, "cpt_opt")

    def test_pretraining_cpt_is_not_a_visa(self):
        kind, _ = aggregate.classify_text(
            "Participate in continued pre-training / CPT, SFT, preference optimization, and reinforcement learning."
        )
        self.assertEqual(kind, "unknown")

    def test_no_before_sponsorship_available(self):
        kind, _ = aggregate.classify_text(
            "Note: No relocation assistance or visa sponsorship is available for this position."
        )
        self.assertEqual(kind, "no")

    def test_future_sponsorship_not_eligible(self):
        kind, _ = aggregate.classify_text(
            "Applicants requiring future sponsorship for continued work authorization (for example, following F-1 OPT/CPT) are not eligible."
        )
        self.assertEqual(kind, "no")

    def test_cpt_holders_not_eligible(self):
        kind, _ = aggregate.classify_text("OPT and CPT visa holders are not eligible.")
        self.assertEqual(kind, "no")

    def test_form_checkbox_is_not_acceptance(self):
        kind, _ = aggregate.classify_text("*F-1 & M-1 Visas must select Yes.* * Select...")
        self.assertEqual(kind, "unknown")

    def test_consult_international_office_is_not_acceptance(self):
        kind, _ = aggregate.classify_text(
            "If your work authorization is tied to your student status, consult the Office of International Students to verify your specific eligibility requirements."
        )
        self.assertEqual(kind, "unknown")

    def test_explicit_sponsor_yes(self):
        kind, _ = aggregate.classify_text(
            "We do sponsor and take over sponsorship of employment visas for this role."
        )
        self.assertEqual(kind, "sponsorship")

    def test_training_cpt_near_using_is_not_a_visa(self):
        kind, _ = aggregate.classify_text(
            "Design and execute high-quality post-training runs (CPT, SFT, RL) "
            "to deliver frontier performance using curated data."
        )
        self.assertEqual(kind, "unknown")

    def test_form_question_about_cpt_is_not_acceptance(self):
        kind, _ = aggregate.classify_text(
            "If you answered yes to visa support, regarding CPT, please confirm that "
            "your university supports this CPT arrangement and that you are eligible "
            "to receive authorization under their guidelines."
        )
        self.assertEqual(kind, "unknown")

    def test_f1_opt_sentence_is_acceptance(self):
        kind, evidence = aggregate.classify_text(
            "Legal authorization to work in the US as of the first day of employment, "
            "including F-1 students using OPT or STEM."
        )
        self.assertEqual(kind, "cpt_opt")
        self.assertIn("F-1", evidence)

    def test_sponsorship_question_is_not_an_answer(self):
        kind, _ = aggregate.classify_text(
            "Will you now or in the future require visa sponsorship to work in the United States?"
        )
        self.assertEqual(kind, "unknown")

    def test_sponsorship_field_no_is_refusal(self):
        kind, _ = aggregate.classify_text(
            "Relocation: Not eligible. Is Sponsorship Available?\nNo\nFlex is an equal opportunity employer."
        )
        self.assertEqual(kind, "no")

    def test_sponsorship_field_yes(self):
        kind, _ = aggregate.classify_text(
            "Amount of Travel Required: None Sponsorship: Yes What you'll do is trade."
        )
        self.assertEqual(kind, "sponsorship")

    def test_visa_sponsorship_field_no(self):
        kind, _ = aggregate.classify_text("Relocation: No relocation VISA Sponsorship: No Travel Requirements: None")
        self.assertEqual(kind, "no")

    def test_j1_only_is_not_f1(self):
        kind, _ = aggregate.classify_text(
            "Visa sponsorship: J-1 visa sponsorship is available for eligible candidates."
        )
        self.assertEqual(kind, "unknown")

    def test_f1_score_is_not_a_visa(self):
        kind, _ = aggregate.classify_text(
            "We measure model quality with an F1 score above 0.8 on the held-out set for this research internship."
        )
        self.assertEqual(kind, "unknown")


class LocationTests(unittest.TestCase):
    def test_us_city(self):
        self.assertTrue(aggregate.is_us_location("New York, NY, United States"))
        self.assertTrue(aggregate.is_us_location("NYC"))
        self.assertTrue(aggregate.is_us_location("SF / NYC"))
        self.assertTrue(aggregate.is_us_location("South SF"))
        self.assertTrue(aggregate.is_us_location("Chicago"))
        self.assertFalse(aggregate.is_us_location("London, UK"))

    def test_ontario_california(self):
        self.assertTrue(aggregate.is_us_location("Ontario, CA"))

    def test_canada(self):
        self.assertFalse(aggregate.is_us_location("Toronto, ON, Canada"))
        self.assertFalse(aggregate.is_us_location("Vancouver, BC, CA"))

    def test_remote_us(self):
        self.assertTrue(aggregate.is_us_location("Remote"))
        self.assertFalse(aggregate.is_us_location("Remote / Canada"))

    def test_split_us_and_canada(self):
        self.assertTrue(aggregate.is_us_location("Seattle, WA / Vancouver, BC"))

    def test_other_country_stays_on_the_second_board(self):
        self.assertEqual(aggregate.region_for("Toronto, ON, Canada"), "other")
        self.assertEqual(aggregate.region_for("New York, NY"), "us")
        decision = aggregate.decide(
            {
                "location": "London, United Kingdom",
                "closed": False,
                "citizenship": False,
                "noSponsorship": False,
            },
            "Join our London internship.",
            True,
        )
        self.assertEqual(decision["acceptance"], "silent")


class ParseTests(unittest.TestCase):
    def test_markdown_jobright_row_uses_title_link(self):
        text = """
| Company | Job Title | Location | Work Model | Date Posted |
| ----- | --------- | --------- | ---- | ------- |
| **[Arcesium](http://www.arcesium.com)** | **[Product Management Intern](https://jobright.ai/jobs/info/abc)** | New York, NY, United States | On Site | Oct 26 |
| ↳ | **[Other Intern](https://jobright.ai/jobs/info/def)** | Toronto, ON, Canada | On Site | Oct 26 |
"""
        roles = aggregate.parse_document(text, "jobright-pm", "Product Management")
        self.assertEqual(len(roles), 2)
        self.assertEqual(roles[0]["company"], "Arcesium")
        self.assertEqual(roles[0]["applyUrl"], "https://jobright.ai/jobs/info/abc")
        self.assertEqual(roles[0]["companyUrl"], "http://www.arcesium.com")
        self.assertEqual(roles[1]["company"], "Arcesium")
        self.assertFalse(aggregate.is_us_location(roles[1]["location"]))
        self.assertEqual(roles[0]["category"], "Product Management")

    def test_html_table_and_flags(self):
        text = """
## 💻 Software Engineering Internship Roles
<table>
<tr><th>Company</th><th>Role</th><th>Location</th><th>Application</th><th>Age</th></tr>
<tr>
<td><strong>Databricks</strong></td>
<td>Product Management Intern</td>
<td>San Francisco, CA</td>
<td><a href="https://job-boards.greenhouse.io/databricks/jobs/6883068002">Apply</a></td>
<td>0d</td>
</tr>
<tr>
<td>↳</td>
<td>Software Engineer Intern 🛂</td>
<td>Bellevue, WA</td>
<td><a href="https://job-boards.greenhouse.io/databricks/jobs/42">Apply</a></td>
<td>1d</td>
</tr>
</table>
"""
        roles = aggregate.parse_document(text, "simplify", None)
        self.assertEqual(roles[0]["company"], "Databricks")
        self.assertEqual(roles[0]["category"], "Software Engineering")
        self.assertIn("6883068002", roles[0]["applyUrl"])
        self.assertEqual(roles[1]["company"], "Databricks")
        self.assertTrue(roles[1]["noSponsorship"])
        self.assertFalse(roles[0]["noSponsorship"])

    def test_canonical_greenhouse_id(self):
        self.assertEqual(
            aggregate.canonical_id("https://job-boards.greenhouse.io/databricks/jobs/6883068002?utm=1"),
            "gh:6883068002",
        )
        self.assertEqual(
            aggregate.canonical_id("https://akunacapital.com/careers/job/8018847/?gh_jid=8018847"),
            "gh:8018847",
        )
        self.assertEqual(
            aggregate.canonical_id("https://akunacapital.com/careers/job/8018847/"),
            "gh:8018847",
        )

    def test_merge_prefers_official_board(self):
        roles = aggregate.merge_roles(
            [
                {
                    "company": "Databricks",
                    "role": "PM Intern",
                    "location": "San Francisco, CA",
                    "category": "Product Management",
                    "applyUrl": "https://jobright.ai/jobs/info/abc",
                    "companyUrl": "https://databricks.com",
                    "posted": "2026-10-20",
                    "workModel": None,
                    "sources": ["jobright-pm"],
                    "noSponsorship": False,
                    "citizenship": False,
                    "closed": False,
                },
                {
                    "company": "Databricks",
                    "role": "PM Intern",
                    "location": "San Francisco, CA",
                    "category": "Other",
                    "applyUrl": "https://job-boards.greenhouse.io/databricks/jobs/6883068002",
                    "companyUrl": "",
                    "posted": "2026-10-26",
                    "workModel": None,
                    "sources": ["simplify"],
                    "noSponsorship": False,
                    "citizenship": False,
                    "closed": False,
                },
            ]
        )
        self.assertEqual(len(roles), 1)
        self.assertIn("greenhouse.io", roles[0]["applyUrl"])
        self.assertEqual(roles[0]["sources"], ["jobright-pm", "simplify"])
        self.assertEqual(roles[0]["category"], "Product Management")
        self.assertEqual(roles[0]["posted"], "2026-10-26")

    def test_same_greenhouse_job_collapses_across_locations(self):
        roles = aggregate.merge_roles(
            [
                {
                    "company": "DoorDash",
                    "role": "Software Engineer Intern",
                    "location": "SF / Sunnyvale, CA",
                    "category": "Software Engineering",
                    "applyUrl": "https://job-boards.greenhouse.io/doordashusa/jobs/8263774",
                    "companyUrl": "",
                    "posted": "2026-10-08",
                    "workModel": None,
                    "sources": ["simplify"],
                    "noSponsorship": False,
                    "citizenship": False,
                    "closed": False,
                },
                {
                    "company": "DoorDash",
                    "role": "Software Engineer Intern",
                    "location": "San Francisco, CA / Sunnyvale, CA",
                    "category": "Software Engineering",
                    "applyUrl": "https://job-boards.greenhouse.io/doordashusa/jobs/8263774?utm=1",
                    "companyUrl": "",
                    "posted": "2026-10-08",
                    "workModel": None,
                    "sources": ["vansh"],
                    "noSponsorship": False,
                    "citizenship": False,
                    "closed": False,
                },
            ]
        )
        self.assertEqual(len(roles), 1)
        self.assertEqual(roles[0]["id"], "gh:8263774")
        self.assertEqual(roles[0]["sources"], ["simplify", "vansh"])
        self.assertIn("San Francisco", roles[0]["location"])

    def test_workday_urls(self):
        self.assertEqual(
            aggregate.workday_parts(
                "https://rb.wd5.myworkdayjobs.com/en-US/FRS/job/Atlanta-GA/Intern_R-1"
            ),
            ("rb.wd5.myworkdayjobs.com", "rb", "FRS", "Atlanta-GA/Intern_R-1"),
        )
        self.assertEqual(
            aggregate.workday_parts(
                "https://wd1.myworkdaysite.com/recruiting/wf/WellsFargoJobs/job/CHARLOTTE-NC/Intern_R-2"
            ),
            ("wd1.myworkdaysite.com", "wf", "WellsFargoJobs", "CHARLOTTE-NC/Intern_R-2"),
        )


    def test_jobright_challenge_is_not_an_official_posting(self):
        challenge = (
            "https://jobright.ai/_jr/security/challenge?return="
            "%2Fjobs%2Finfo%2F6aa9b824eff87f571fc9af10%3Futm_source%3Dgit"
        )
        self.assertTrue(aggregate.is_jobright(challenge))
        self.assertEqual(aggregate.jobright_id(challenge), "6aa9b824eff87f571fc9af10")
        self.assertEqual(aggregate.employer_posting(challenge), "")
        role = aggregate.public_role(
            {
                "company": "Waymo",
                "role": "2027 Summer Intern, MBA, Salesforce Product Owner",
                "location": "Los Angeles, CA",
                "category": "Product Management",
                "applyUrl": challenge,
                "officialUrl": challenge,
                "companyUrl": "https://waymo.com",
                "posted": "2026-10-26",
                "sources": ["jobright-pm"],
                "decision": {"acceptance": "silent", "evidence": "", "read": True},
            }
        )
        self.assertEqual(role["officialUrl"], "")
        self.assertEqual(role["applyUrl"], "")
        self.assertEqual(role["companyUrl"], "https://waymo.com")

    def test_nested_markdown_title_keeps_the_role_name(self):
        raw = (
            "[SAP iXp Intern - Product Management, Agile Delivery & PI Planning "
            "[Newtown Square, PA]](https://jobright.ai/jobs/info/6abbeaf43217d1d13329bd2a)"
        )
        self.assertEqual(
            aggregate.clean_label(raw),
            "SAP iXp Intern - Product Management, Agile Delivery & PI Planning [Newtown Square, PA]",
        )

    def test_employer_search_skips_jobright_and_linkedin(self):
        chosen = aggregate.choose_employer_link(
            [
                "https://www.linkedin.com/jobs/view/2027-summer-intern-at-waymo-1",
                "https://jobright.ai/jobs/info/6aa9b824eff87f571fc9af10",
                "https://careers.withwaymo.com/jobs/2027-summer-intern-mba-salesforce-product-owner-los-angeles-california-united-states",
            ],
            "Waymo",
        )
        self.assertIn("careers.withwaymo.com", chosen)

    def test_amazon_career_search_uses_the_jobs_site(self):
        query = aggregate.career_query("Business Analyst Intern – Summer 2027")
        self.assertEqual(query, "Business Analyst Intern")
        link = aggregate.career_search_url("https://www.amazon.jobs/en/", "", query)
        self.assertEqual(
            link,
            "https://www.amazon.jobs/en/search?base_query=Business+Analyst+Intern"
            "&loc_query=&latitude=&longitude=&loc_group_id=&invalid_location=false"
            "&country=&city=&region=&county=",
        )
        self.assertIn("https://www.amazon.jobs/", aggregate.career_candidates("Amazon", "https://amazon.com"))

    def test_about_careers_on_the_company_site_stays_there(self):
        link = aggregate.career_search_url(
            "https://www.micron.com/about/careers",
            "",
            "Business Analyst Intern",
        )
        self.assertEqual(link, "https://www.micron.com/about/careers?q=Business+Analyst+Intern")

    def test_oracle_site_keeps_the_language_prefix(self):
        link = aggregate.career_search_url(
            "https://careers.americanexpress.com/en/sites/CX_1",
            "",
            "Product Intern",
        )
        self.assertEqual(
            link,
            "https://careers.americanexpress.com/en/sites/CX_1/jobs?keyword=Product+Intern",
        )

    def test_tiktok_404_is_not_a_career_site(self):
        self.assertFalse(aggregate.looks_like_career("https://www.tiktok.com/404?fromUrl=/careers", "TikTok"))
        self.assertTrue(aggregate.looks_like_career("https://lifeattiktok.com/", "TikTok"))

    def test_jobs_host_search_keeps_the_role(self):
        link = aggregate.career_search_url(
            "https://jobs.nvidia.com/careers",
            "",
            "Product Management Intern",
        )
        self.assertEqual(link, "https://jobs.nvidia.com/careers?query=Product+Management+Intern")

    def test_search_jobs_form_uses_the_role_in_the_path(self):
        link = aggregate.career_search_url(
            "https://jobs.spectrum.com/",
            '<form action="/search-jobs"></form>',
            "Business Systems Analyst Intern",
        )
        self.assertEqual(
            link,
            "https://jobs.spectrum.com/search-jobs/Business%20Systems%20Analyst%20Intern",
        )

    def test_employer_search_ignores_a_different_company(self):
        chosen = aggregate.choose_employer_link(
            ["https://jobs.example.com/job/business-analyst-intern"],
            "Spectrum",
        )
        self.assertEqual(chosen, "")


if __name__ == "__main__":
    unittest.main()
