from app.database.database import async_session
from app.models.project import Project
from app.models.team import Team, TeamMember
from app.models.sprint import Sprint
from app.models.task import Task
from app.models.risk import Risk
from app.models.report import Report
from datetime import datetime, timedelta
import random

random.seed(42)


async def seed_database():
    async with async_session() as session:
        existing = (await session.execute(__import__('sqlalchemy').select(Project))).scalars().first()
        if existing:
            return

        # --- Projects ---
        projects = [
            Project(
                name="Project Alpha", description="Enterprise SaaS platform - core product rebuild",
                status="active", health_score=92, completion=78,
                budget=450000, budget_used=312000,
                start_date=datetime.now() - timedelta(days=68),
                target_date=datetime.now() + timedelta(days=22),
            ),
            Project(
                name="Project Beta", description="Mobile app v2.0 - iOS & Android redesign",
                status="warning", health_score=65, completion=52,
                budget=280000, budget_used=198000,
                start_date=datetime.now() - timedelta(days=45),
                target_date=datetime.now() + timedelta(days=35),
            ),
            Project(
                name="Project Gamma", description="Legacy data migration to cloud infrastructure",
                status="critical", health_score=41, completion=33,
                budget=180000, budget_used=156000,
                start_date=datetime.now() - timedelta(days=60),
                target_date=datetime.now() + timedelta(days=10),
            ),
            Project(
                name="Project Delta", description="Public API v3 with GraphQL support",
                status="active", health_score=81, completion=67,
                budget=320000, budget_used=198000,
                start_date=datetime.now() - timedelta(days=55),
                target_date=datetime.now() + timedelta(days=28),
            ),
            Project(
                name="Project Epsilon", description="Internal analytics dashboard for executives",
                status="active", health_score=88, completion=85,
                budget=150000, budget_used=118000,
                start_date=datetime.now() - timedelta(days=40),
                target_date=datetime.now() + timedelta(days=8),
            ),
            Project(
                name="Project Zeta", description="Customer onboarding automation pipeline",
                status="warning", health_score=58, completion=44,
                budget=220000, budget_used=175000,
                start_date=datetime.now() - timedelta(days=50),
                target_date=datetime.now() + timedelta(days=18),
            ),
        ]
        session.add_all(projects)
        await session.flush()

        # --- Teams ---
        teams_data = [
            ("Backend Team", "John Smith", 8, 42, 85),
            ("Frontend Team", "Sarah Johnson", 6, 38, 72),
            ("DevOps Team", "Mike Chen", 4, 28, 90),
            ("QA Team", "Lisa Park", 5, 35, 68),
            ("Mobile Team", "Alex Rivera", 7, 40, 78),
            ("Data Team", "Emma Wilson", 4, 30, 55),
        ]
        teams = []
        for name, lead, count, vel, work in teams_data:
            team = Team(name=name, lead=lead, member_count=count, velocity=vel, workload=work)
            teams.append(team)
        session.add_all(teams)
        await session.flush()

        # --- Team Members ---
        members_data = [
            (1, [("John Smith", "Tech Lead", 90, 24, 18), ("David Lee", "Senior Backend", 85, 20, 16),
                 ("Priya Patel", "Backend Dev", 78, 18, 14), ("Marcus Johnson", "Backend Dev", 72, 16, 13),
                 ("Sophie Zhang", "Backend Dev", 80, 17, 14), ("Carlos Ruiz", "Junior Dev", 60, 12, 9),
                 ("Anna Kim", "Database Engineer", 88, 22, 19), ("Tom Wilson", "Backend Dev", 75, 15, 12)]),
            (2, [("Sarah Johnson", "Frontend Lead", 82, 21, 17), ("James Brown", "Senior Frontend", 78, 19, 15),
                 ("Emily Chen", "UI Developer", 70, 16, 13), ("Ryan O'Brien", "Frontend Dev", 68, 14, 11),
                 ("Maya Gupta", "UX Engineer", 65, 13, 11), ("Leo Martinez", "Junior Frontend", 55, 10, 8)]),
            (3, [("Mike Chen", "DevOps Lead", 92, 18, 15), ("Jake Williams", "SRE", 88, 16, 14),
                 ("Fatima Hassan", "Cloud Engineer", 85, 15, 13), ("Kevin Park", "DevOps Engineer", 80, 14, 12)]),
            (4, [("Lisa Park", "QA Lead", 75, 20, 17), ("Chris Taylor", "Senior QA", 70, 18, 15),
                 ("Aisha Mohammed", "QA Automation", 65, 16, 13), ("Daniel Kim", "QA Engineer", 62, 14, 11),
                 ("Rachel Green", "QA Engineer", 58, 12, 10)]),
            (5, [("Alex Rivera", "Mobile Lead", 80, 19, 15), ("Nina Volkov", "iOS Developer", 78, 17, 14),
                 ("Omar Farooq", "Android Dev", 75, 16, 13), ("Yuki Tanaka", "React Native", 72, 15, 12),
                 ("Ben Cooper", "Mobile Dev", 68, 14, 11), ("Sara Olsen", "Mobile Dev", 65, 13, 10),
                 ("Ravi Kumar", "Junior Mobile", 55, 10, 8)]),
            (6, [("Emma Wilson", "Data Lead", 70, 15, 13), ("Luis Garcia", "Data Engineer", 65, 14, 12),
                 ("Hannah Smith", "ML Engineer", 60, 12, 10), ("Victor Nguyen", "Data Analyst", 50, 10, 8)]),
        ]
        for team_id, members in members_data:
            for name, role, workload, assigned, completed in members:
                session.add(TeamMember(
                    team_id=team_id, name=name, role=role,
                    workload=workload, tasks_assigned=assigned, tasks_completed=completed
                ))

        # --- Sprints ---
        sprint_configs = [
            (1, [("Sprint 5", 5, "completed", 38, 28, 36), ("Sprint 6", 6, "completed", 42, 30, 40),
                 ("Sprint 7", 7, "active", 35, 32, 22)]),
            (2, [("Sprint 3", 3, "completed", 30, 25, 28), ("Sprint 4", 4, "active", 28, 28, 14)]),
            (3, [("Sprint 4", 4, "completed", 22, 20, 18), ("Sprint 5", 5, "active", 20, 22, 8)]),
            (4, [("Sprint 4", 4, "completed", 35, 28, 33), ("Sprint 5", 5, "completed", 38, 30, 36),
                 ("Sprint 6", 6, "active", 32, 30, 20)]),
            (5, [("Sprint 6", 6, "active", 25, 22, 19)]),
            (6, [("Sprint 3", 3, "active", 24, 24, 10)]),
        ]
        sprints = []
        for proj_id, sprint_list in sprint_configs:
            for name, num, status, vel, planned, completed in sprint_list:
                s = Sprint(
                    project_id=proj_id, name=name, number=num, status=status,
                    velocity=vel, planned_points=planned, completed_points=completed,
                    start_date=datetime.now() - timedelta(days=14 * (8 - num)),
                    end_date=datetime.now() - timedelta(days=14 * (7 - num)) if status == "completed" else datetime.now() + timedelta(days=7),
                )
                sprints.append(s)
        session.add_all(sprints)
        await session.flush()

        # --- Tasks ---
        task_templates = [
            # Project Alpha tasks
            (1, [
                ("Implement OAuth2 authentication flow", "done", "high", "John Smith", 8),
                ("Build user dashboard API endpoints", "done", "high", "David Lee", 5),
                ("Create real-time notification system", "in_progress", "high", "Priya Patel", 8),
                ("Implement rate limiting middleware", "done", "medium", "Marcus Johnson", 3),
                ("Build file upload service", "in_progress", "medium", "Sophie Zhang", 5),
                ("Integrate Stripe payment processing", "in_progress", "critical", "John Smith", 13),
                ("Write API integration tests", "todo", "high", "Carlos Ruiz", 5),
                ("Optimize database query performance", "in_progress", "high", "Anna Kim", 8),
                ("Implement caching layer with Redis", "blocked", "high", "Tom Wilson", 5),
                ("Build admin panel CRUD operations", "done", "medium", "David Lee", 5),
                ("Set up CI/CD pipeline for staging", "done", "high", "Mike Chen", 3),
                ("Create webhook delivery system", "todo", "medium", "Priya Patel", 5),
                ("Implement audit logging", "in_progress", "medium", "Marcus Johnson", 3),
                ("Build search indexing with Elasticsearch", "blocked", "high", "Anna Kim", 8),
                ("Performance load testing", "todo", "high", "Lisa Park", 5),
            ]),
            # Project Beta tasks
            (2, [
                ("Redesign login/signup screens", "done", "high", "Sarah Johnson", 5),
                ("Build bottom navigation component", "done", "medium", "James Brown", 3),
                ("Implement push notification system", "in_progress", "high", "Alex Rivera", 8),
                ("Create offline-first data sync", "blocked", "critical", "Nina Volkov", 13),
                ("Build camera integration module", "in_progress", "medium", "Omar Farooq", 5),
                ("Implement biometric authentication", "todo", "high", "Yuki Tanaka", 8),
                ("Optimize app startup time", "in_progress", "medium", "Ben Cooper", 3),
                ("Build in-app messaging feature", "todo", "high", "Sara Olsen", 8),
                ("Create onboarding walkthrough", "done", "medium", "Emily Chen", 3),
                ("Implement deep linking", "blocked", "medium", "Ryan O'Brien", 5),
                ("Build analytics event tracking", "todo", "low", "Ravi Kumar", 3),
                ("App store submission prep", "todo", "high", "Alex Rivera", 2),
            ]),
            # Project Gamma tasks
            (3, [
                ("Map legacy database schemas", "done", "critical", "Emma Wilson", 8),
                ("Build ETL pipeline for user data", "in_progress", "critical", "Luis Garcia", 13),
                ("Migrate transaction history", "blocked", "critical", "Hannah Smith", 13),
                ("Validate data integrity post-migration", "todo", "critical", "Victor Nguyen", 8),
                ("Set up rollback procedures", "in_progress", "high", "Mike Chen", 5),
                ("Migrate file attachments to S3", "blocked", "high", "Jake Williams", 8),
                ("Update API endpoints for new schema", "blocked", "high", "David Lee", 5),
                ("Performance testing on migrated data", "todo", "high", "Lisa Park", 5),
                ("Create migration monitoring dashboard", "todo", "medium", "Fatima Hassan", 5),
                ("Document migration runbook", "in_progress", "medium", "Kevin Park", 3),
            ]),
            # Project Delta tasks
            (4, [
                ("Design GraphQL schema", "done", "critical", "John Smith", 8),
                ("Implement query resolvers", "done", "high", "Priya Patel", 8),
                ("Build mutation handlers", "in_progress", "high", "Marcus Johnson", 8),
                ("Implement subscription endpoints", "in_progress", "medium", "Sophie Zhang", 5),
                ("Create API documentation portal", "done", "medium", "Carlos Ruiz", 3),
                ("Build rate limiting for GraphQL", "todo", "high", "Tom Wilson", 5),
                ("Implement query complexity analysis", "in_progress", "medium", "David Lee", 5),
                ("Write comprehensive API tests", "todo", "high", "Chris Taylor", 5),
                ("Build SDK for JavaScript clients", "todo", "medium", "James Brown", 8),
                ("Create migration guide from v2", "done", "medium", "John Smith", 3),
                ("Set up API monitoring & alerting", "in_progress", "high", "Jake Williams", 3),
            ]),
            # Project Epsilon tasks
            (5, [
                ("Build executive KPI dashboard", "done", "critical", "Sarah Johnson", 8),
                ("Implement real-time data widgets", "done", "high", "Emily Chen", 5),
                ("Create custom report builder", "done", "high", "Ryan O'Brien", 8),
                ("Build export to PDF/Excel", "in_progress", "medium", "Maya Gupta", 5),
                ("Implement role-based access control", "done", "high", "John Smith", 5),
                ("Create automated email reports", "done", "medium", "Leo Martinez", 3),
                ("Build drill-down analytics views", "in_progress", "medium", "Sarah Johnson", 5),
                ("Implement data caching for dashboards", "done", "medium", "Anna Kim", 3),
            ]),
            # Project Zeta tasks
            (6, [
                ("Design onboarding workflow engine", "done", "critical", "Emma Wilson", 8),
                ("Build email sequence automation", "in_progress", "high", "Luis Garcia", 8),
                ("Create customer segmentation logic", "in_progress", "high", "Hannah Smith", 5),
                ("Implement progress tracking API", "blocked", "high", "Victor Nguyen", 5),
                ("Build A/B testing for onboarding flows", "todo", "medium", "David Lee", 8),
                ("Create analytics for conversion funnel", "todo", "high", "Maya Gupta", 5),
                ("Integrate with CRM system", "blocked", "high", "Carlos Ruiz", 8),
                ("Build self-service configuration UI", "todo", "medium", "Emily Chen", 5),
                ("Implement webhook triggers", "todo", "medium", "Tom Wilson", 3),
                ("Write integration tests", "todo", "medium", "Aisha Mohammed", 5),
            ]),
        ]

        for proj_id, tasks in task_templates:
            active_sprint = next((s for s in sprints if s.project_id == proj_id and s.status == "active"), None)
            for title, status, priority, assignee, points in tasks:
                session.add(Task(
                    project_id=proj_id,
                    sprint_id=active_sprint.id if active_sprint and status != "done" else None,
                    title=title, status=status, priority=priority,
                    assignee=assignee, story_points=points,
                    due_date=datetime.now() + timedelta(days=random.randint(-5, 14)),
                ))

        # --- Risks ---
        risks_data = [
            (1, "Redis cluster not provisioned", "Infrastructure dependency blocking caching implementation", "high", "technical", "open", 65),
            (1, "Payment integration deadline pressure", "Stripe integration is complex; may delay sprint completion", "medium", "schedule", "open", 45),
            (2, "Offline sync architecture uncertain", "No proven pattern for bidirectional offline sync on both platforms", "critical", "technical", "open", 80),
            (2, "App store review timeline", "Apple review process may add 1-2 weeks to launch", "medium", "schedule", "open", 40),
            (3, "Data migration window too narrow", "Only 4-hour maintenance window approved; migration may need 6+", "critical", "schedule", "open", 90),
            (3, "Legacy data inconsistencies", "Found 12% of records with integrity issues in source DB", "critical", "technical", "open", 85),
            (3, "Budget overrun likely", "86% budget consumed at 33% completion", "high", "budget", "open", 75),
            (4, "GraphQL N+1 query performance", "Some queries causing excessive database calls", "medium", "technical", "open", 50),
            (6, "CRM API rate limits", "Salesforce API limits may throttle onboarding at scale", "high", "technical", "open", 60),
            (6, "Scope creep from stakeholders", "Marketing requesting additional onboarding paths", "medium", "scope", "open", 55),
        ]
        for proj_id, title, desc, severity, category, status, impact in risks_data:
            session.add(Risk(
                project_id=proj_id, title=title, description=desc,
                severity=severity, category=category, status=status, impact_score=impact,
            ))

        # --- Reports ---
        reports_data = [
            (None, "executive", "Weekly Portfolio Summary", "Overall health: 87%. 6 active projects. 3 high-risk items. Project Gamma requires immediate intervention."),
            (1, "sprint_review", "Sprint 7 Review - Project Alpha", "Velocity: 35 pts. 22/32 points completed. On track for sprint goal. Payment integration is largest remaining item."),
            (3, "risk", "Risk Assessment - Project Gamma", "CRITICAL: Project is 67% behind schedule with 86% budget consumed. Recommend emergency scope reduction and timeline extension."),
            (None, "standup", "Daily Standup Summary", "12 tasks completed yesterday. 18 in progress today. 6 blockers identified across 3 projects. Highest priority: unblock data migration."),
            (2, "sprint_review", "Sprint 4 Mid-Sprint Check - Project Beta", "50% through sprint, 50% of points completed. Offline sync blocker is main concern."),
        ]
        for proj_id, rtype, title, content in reports_data:
            session.add(Report(
                project_id=proj_id, type=rtype, title=title, content=content,
                created_at=datetime.now() - timedelta(hours=random.randint(1, 72)),
            ))

        await session.commit()
        print("Database seeded successfully with demo data!")
