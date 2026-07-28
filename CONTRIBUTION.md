# Proposing Changes

## Getting Started
1. Create a branch from `beta`.
1. Update the version number in `package.json` according to semver based on the nature of the changes you intend to make.
1. Create a pull request pointing back to `beta`.
1. Implement your changes on your branch and push.
1. Request a review on your PR when you're done making changes.

## Releases
### `alpha`
When a PR is made to the `beta` branch, an `alpha` release is automatically published each time a commit is pushed to the PR. Once the PR is merged into the `beta` branch, the source branch will be deleted automatically. Merges into `beta` are squashed, so deleting the source branch is ideal to prevent conflicts.

### `beta`
Once merged, a `beta` release is published from the `beta` branch.

### Stable versions
Changes from the `beta` branch will periodically be merged (fast-forward) into the `stable` branch once they are tested and confirmed stable. Changes to the `stable` branch are automatically published to npm as stable releases with the tag `latest`.

An intermediate commit from `beta` may be merged into `stable` if newer commits have known bugs that are yet to be fixed.

#### Resolving Blockers
If an older commit on `beta` has a bug that will be a blocker for newer unrelated updates which are more stable, the errant commit's changes should be reverted (can be done in one click on GitHub Desktop) and a new release should be published with the reverted changes. A new branch can then be created from here, the changes should be restored on this branch, and the issues can be resolved properly. The feature/fix can then be reintroduced into `beta` with a new version number when all the kinks have been worked out.

## Branch Naming
When creating a branch from the `beta` branch, there are two types of branches you can choose from.

### Feature branch
This is a branch you intend to push changes directly into as you work. These branches should follow a standard naming convention as described below:

```
{type}/{ownerInitials}-descriptive-name
```

#### Type
The `type` should be one of:
- `feat` - For new features or enhancements to existing features.
- `fix` - For patches and bug fixes.
- `chore` - For changes that don't impact the library's runtime, e.g updating docs or pipeline scripts.

#### Initials
The `ownerInitials` should substituted with a 2 or 3 letter long string representing the author's initials.

#### Example
If a contributor named John Doe wanted to use a feature branch to contribute a fix for a hypothetical bug that caused crashes on Safari, the branch name would be something like:

```
fix/jd-safari-crash
```

### Base Branch
If you expect to push changes rapidly and would like to avoid making an alpha release for each push, you should create a base branch instead.

> Follow the same steps as described in the [getting started](#getting-started) section above, to create the branch, update the version number, and create the pull request.

This should be used when contributing through the standard **fork-and-pull** method.

This is also ideal for:
- Long running work you expected to be completed in stages.
- Work that is split between multiple contributors, each implementing separate aspects of the same feature.

#### How It Works
The base branch serves as a middleman between your working branch and the `beta` branch. It allows you to better control when `alpha` releases are published, by making changes on a separate feature branch and only merging into the base branch when you are actual ready to publish an alpha release and request an in-depth review.

#### Naming
Base branches should follow the [naming pattern for feature branches](#feature-branch) but use the type alias `base`. The initials may be omitted from a base branch's name since base branches are more likely to include changes from multiple authors. The initials should still be used whenever possible, either to indicate a sole contributor or perhaps a lead contributor in the case of multiple contributors.

Feature branches should then be created from the base branch using the feature branch naming convention as described above. Merge your feature branch into the base branch whenever you want to publish a release to the `alpha` channel. Then request a review on the base branch's PR when it is all ready to be merged into `beta`.
