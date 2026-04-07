# Relationship Map

Text-based diagrams showing all model connections grouped by domain graph.

## Content Graph

```
User
 |-- 1:N --> Content (authorId)
 |-- 1:N --> Review (reviewerId)
 |-- 1:N --> ReviewComment (authorId)
 |-- 1:N --> Brief (createdBy)
 |-- 1:N --> Release (createdBy)
 |-- 1:N --> Experiment (createdBy)

Content
 |-- N:M --> Tag           (via ContentTag junction)
 |-- N:M --> Skill         (via ContentSkill junction, with relevance score)
 |-- 1:N --> Asset         (contentId, SetNull on delete)
 |-- N:M --> Collection    (via CollectionItem junction, ordered)
 |-- N:M --> CurriculumUnit (via CurriculumItem junction, ordered)
 |-- N:M --> OfflinePack   (via OfflinePackItem junction)
 |-- N:M --> Experiment    (via ExperimentVariant, optional)
 |-- self N:M --> SimilarContent (contentAId / contentBId)

Asset
 |-- 1:N --> AssetVariant  (assetId, cascade delete)

Collection
 |-- 1:N --> CollectionItem (collectionId, cascade delete)

Curriculum
 |-- 1:N --> CurriculumUnit (curriculumId, cascade delete)
    |-- 1:N --> CurriculumItem (unitId, cascade delete)
       |-- N:1 --> Content
```

## Workflow Graph

```
Content
 |-- 1:N --> Review
 |              |-- 1:N --> ReviewComment (cascade delete)
 |              |-- N:1 --> User (reviewer)
 |
 |-- 1:N --> Release
 |              |-- N:1 --> User (creator)
 |
 |-- 1:N --> QAResult
 |
 |-- 1:N --> Translation
                (unique: contentId + locale + field)
```

## AI Pipeline Graph

```
Content
 |-- 1:N --> StoryStep     (cascade delete, ordered by orderIndex)
 |-- 1:N --> IllustrationJob
 |-- 1:N --> VoiceJob

User
 |-- 1:N --> Brief
                |-- (generates) --> Content (via generatedContent JSON)

Prompt
 |-- 1:N --> PromptUsage   (logs input/output/tokens/latency)
```

## Analytics Graph

```
Content
 |-- 1:N --> ContentAnalytics (unique: contentId + period + periodKey)
 |-- self N:M --> SimilarContent

Experiment
 |-- 1:N --> ExperimentVariant (cascade delete)
 |              |-- N:1 --> Content (optional)
 |              |-- 1:N --> ExperimentResult
 |-- 1:N --> ExperimentResult
 |-- N:1 --> User (creator)
```

## Household Graph

```
Household
 |-- 1:N --> ParentAccount     (cascade delete)
 |              |-- 1:N --> ParentalSettings (cascade delete, unique: parentId + key)
 |
 |-- 1:N --> ChildProfile      (cascade delete)
 |              |-- 1:N --> ProfilePreference (cascade delete, unique: profileId + key)
 |
 |-- 1:N --> CaregiverInvite   (cascade delete)
```

## System Graph

```
AuditLog (standalone, references entities by string entity + entityId)
 |-- indexed by: [entity, entityId], [userId], [createdAt]

Permission (standalone, no FK relations)
 |-- unique: [role, resource, action]

LicensedRight
 |-- N:1 --> Content (contentId)
```

## Cascade Delete Summary

| Parent | Child | On Delete |
|--------|-------|-----------|
| Content | ContentTag | Cascade |
| Content | ContentSkill | Cascade |
| Content | StoryStep | Cascade |
| Tag | ContentTag | Cascade |
| Skill | ContentSkill | Cascade |
| Content | Asset | SetNull (orphan asset) |
| Asset | AssetVariant | Cascade |
| Collection | CollectionItem | Cascade |
| Curriculum | CurriculumUnit | Cascade |
| CurriculumUnit | CurriculumItem | Cascade |
| Review | ReviewComment | Cascade |
| Experiment | ExperimentVariant | Cascade |
| Household | ParentAccount | Cascade |
| Household | ChildProfile | Cascade |
| Household | CaregiverInvite | Cascade |
| ParentAccount | ParentalSettings | Cascade |
| ChildProfile | ProfilePreference | Cascade |
| OfflinePack | OfflinePackItem | Cascade |
